/**
 * Quantitative Prediction Market Formulas
 * Implements Odds Normalization, Arbitrage Spread Detection,
 * Kelly Criterion Position Sizing, and Expected Value (EV) Modeling.
 */

import { MarketOddsAnalysis, KellySizingResult } from '../../types/odds';

/**
 * Evaluates market pricing for probability skew, over-round, and arbitrage spreads
 */
export function analyzeMarketOdds(
  marketId: string,
  yesPrice: number,
  noPrice: number
): MarketOddsAnalysis {
  const safeYes = Math.max(0.0001, Math.min(0.9999, yesPrice));
  const safeNo = Math.max(0.0001, Math.min(0.9999, noPrice));
  const sum = safeYes + safeNo;

  const normalizedYesProb = safeYes / sum;
  const normalizedNoProb = safeNo / sum;

  // An arbitrage exists if sum < 1.0 (buying both sides guarantees > 1.0 payout)
  const isMispricedArbitrage = sum < 0.98 || sum > 1.05;
  const spreadPercent = Math.abs(sum - 1.0) * 100;

  const favoriteSide: 'YES' | 'NO' = safeYes >= safeNo ? 'YES' : 'NO';
  const underdogMultiplier = favoriteSide === 'YES' ? 1 / safeNo : 1 / safeYes;

  return {
    marketId,
    yesPrice: safeYes,
    noPrice: safeNo,
    totalImpliedProbability: sum,
    isMispricedArbitrage,
    spreadPercent,
    normalizedYesProb,
    normalizedNoProb,
    favoriteSide,
    underdogMultiplier: Number(underdogMultiplier.toFixed(2))
  };
}

/**
 * Calculates Kelly Criterion fractional stake and Expected Value (EV)
 *
 * Kelly Formula: f* = (b * p - q) / b
 * where:
 *   b = net fractional odds received on wager (e.g. payout / stake - 1)
 *   p = perceived subjective probability of winning (0.0 to 1.0)
 *   q = probability of losing (1 - p)
 */
export function calculateKellySizing(
  marketPrice: number,          // e.g. 0.60 USDC per share (paying 1.00 on win)
  subjectiveConfidence: number, // trader's perceived probability (e.g. 0.75 = 75%)
  bankrollUsdc = 1000,
  fractionalKelly = 0.5         // Half-Kelly default for volatility dampening
): KellySizingResult {
  const p = Math.max(0.01, Math.min(0.99, subjectiveConfidence));
  const q = 1 - p;
  const price = Math.max(0.01, Math.min(0.99, marketPrice));

  // Net odds b = (1.00 - price) / price
  const b = (1.0 - price) / price;

  // Full Kelly fraction
  const rawFraction = (b * p - q) / b;

  if (rawFraction <= 0) {
    return {
      fraction: 0,
      recommendedStakeUsdc: 0,
      expectedValueUsdc: 0,
      expectedRoiPercent: ((p / price) - 1) * 100,
      edgePercent: (p - price) * 100,
      riskRating: 'NEGATIVE_EV'
    };
  }

  // Apply fractional multiplier (e.g. Half-Kelly) and cap at 25% max bankroll safety
  const safeFraction = Math.min(0.25, rawFraction * fractionalKelly);
  const recommendedStakeUsdc = Number((bankrollUsdc * safeFraction).toFixed(2));

  // Expected Value calculation
  const payoutIfWin = recommendedStakeUsdc / price;
  const expectedValueUsdc = Number((p * (payoutIfWin - recommendedStakeUsdc) - q * recommendedStakeUsdc).toFixed(2));
  const expectedRoiPercent = Number((((p / price) - 1) * 100).toFixed(2));
  const edgePercent = Number(((p - price) * 100).toFixed(2));

  let riskRating: KellySizingResult['riskRating'] = 'MODERATE';
  if (safeFraction < 0.05) riskRating = 'CONSERVATIVE';
  else if (safeFraction > 0.15) riskRating = 'AGGRESSIVE';

  return {
    fraction: Number(safeFraction.toFixed(4)),
    recommendedStakeUsdc,
    expectedValueUsdc,
    expectedRoiPercent,
    edgePercent,
    riskRating
  };
}

/**
 * Calculates deterministic share output and fee breakdown for a primary trade
 */
export function estimateTradeOutput(
  inputUsdc: number,
  side: 'YES' | 'NO',
  currentPrice: number,
  _slippagePercent = 0.5,
  protocolFeeRate = 0.01, // 1%
  creatorFeeRate = 0.005  // 0.5%
) {
  const safeInput = Math.max(1, inputUsdc);
  const totalFeeRate = protocolFeeRate + creatorFeeRate;
  const totalFeeUsdc = Number((safeInput * totalFeeRate).toFixed(4));
  const netInputUsdc = safeInput - totalFeeUsdc;

  // Approximate price impact: sqrt scaling
  const priceImpactPercent = Math.min(15, (safeInput / 5000) * 1.5);
  const effectivePrice = Math.min(0.99, currentPrice * (1 + priceImpactPercent / 100));

  const expectedShares = Number((netInputUsdc / effectivePrice).toFixed(4));
  const maxPayoutUsdc = expectedShares * 1.0; // Each share pays 1.00 USDC on win
  const potentialNetProfitUsdc = Number((maxPayoutUsdc - safeInput).toFixed(2));
  const potentialRoiPercent = Number(((potentialNetProfitUsdc / safeInput) * 100).toFixed(2));

  return {
    side,
    inputUsdc: safeInput,
    expectedShares,
    effectivePrice: Number(effectivePrice.toFixed(4)),
    priceImpactPercent: Number(priceImpactPercent.toFixed(2)),
    protocolFeeUsdc: Number((safeInput * protocolFeeRate).toFixed(4)),
    creatorFeeUsdc: Number((safeInput * creatorFeeRate).toFixed(4)),
    totalFeeUsdc,
    maxPayoutUsdc: Number(maxPayoutUsdc.toFixed(2)),
    potentialNetProfitUsdc,
    potentialRoiPercent
  };
}
