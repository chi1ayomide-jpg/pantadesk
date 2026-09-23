import { describe, it, expect } from 'vitest';
import { analyzeMarketOdds, calculateKellySizing, estimateTradeOutput } from '../domain/odds/odds-math';

describe('Quantitative Prediction Market Math & Kelly Engine', () => {
  it('correctly normalizes continuous market share prices to probabilities', () => {
    const analysis = analyzeMarketOdds('mkt_1', 0.60, 0.40);
    expect(analysis.normalizedYesProb).toBeCloseTo(0.60, 4);
    expect(analysis.normalizedNoProb).toBeCloseTo(0.40, 4);
    expect(analysis.totalImpliedProbability).toBe(1.00);
    expect(analysis.isMispricedArbitrage).toBe(false);
    expect(analysis.favoriteSide).toBe('YES');
    expect(analysis.underdogMultiplier).toBeCloseTo(2.50, 2);
  });

  it('detects mispriced arbitrage when sum of prices is under 1.0 (free lunch / under-round)', () => {
    // If YES = 0.45 and NO = 0.45, sum = 0.90 -> buying both sides gives 10% risk-free arb
    const analysis = analyzeMarketOdds('mkt_arb', 0.45, 0.45);
    expect(analysis.totalImpliedProbability).toBeCloseTo(0.90, 4);
    expect(analysis.isMispricedArbitrage).toBe(true);
    expect(analysis.spreadPercent).toBeCloseTo(10.0, 1);
  });

  it('calculates Kelly Criterion positive stake when subjective edge exists', () => {
    // Market price = 0.50 (even odds), but trader confidence is 70% (high edge)
    const sizing = calculateKellySizing(0.50, 0.70, 1000, 0.5); // Half-Kelly on $1000
    expect(sizing.edgePercent).toBeCloseTo(20.0, 1);
    expect(sizing.recommendedStakeUsdc).toBeGreaterThan(0);
    expect(sizing.expectedValueUsdc).toBeGreaterThan(0);
    expect(sizing.expectedRoiPercent).toBeCloseTo(40.0, 1);
    expect(sizing.riskRating).not.toBe('NEGATIVE_EV');
  });

  it('clamps Kelly sizing to 0 when subjective confidence has negative EV', () => {
    // Market price = 0.70, but trader confidence is only 50% (negative EV)
    const sizing = calculateKellySizing(0.70, 0.50, 1000);
    expect(sizing.fraction).toBe(0);
    expect(sizing.recommendedStakeUsdc).toBe(0);
    expect(sizing.riskRating).toBe('NEGATIVE_EV');
    expect(sizing.edgePercent).toBeLessThan(0);
  });

  it('estimates trade outputs with protocol and creator fee deduction', () => {
    const trade = estimateTradeOutput(100, 'YES', 0.50, 0.5, 0.01, 0.005);
    expect(trade.inputUsdc).toBe(100);
    expect(trade.protocolFeeUsdc).toBe(1.0);
    expect(trade.creatorFeeUsdc).toBe(0.5);
    expect(trade.totalFeeUsdc).toBe(1.5);
    expect(trade.expectedShares).toBeGreaterThan(0);
    expect(trade.maxPayoutUsdc).toBeGreaterThan(trade.inputUsdc);
  });
});
