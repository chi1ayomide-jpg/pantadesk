/**
 * Quantitative Odds, Kelly Criterion & Expected Value (EV) Models
 */

export interface MarketOddsAnalysis {
  marketId: string;
  yesPrice: number;
  noPrice: number;
  totalImpliedProbability: number; // e.g. 1.00 or 1.04 (over-round / spread)
  isMispricedArbitrage: boolean;    // true if sum < 1.00 (under-round free lunch) or sum > 1.05 (high rake)
  spreadPercent: number;           // |yesPrice + noPrice - 1.0| * 100
  normalizedYesProb: number;       // normalized probability 0.0 - 1.0
  normalizedNoProb: number;        // normalized probability 0.0 - 1.0
  favoriteSide: 'YES' | 'NO';
  underdogMultiplier: number;      // e.g. 3.2x payout
}

export interface KellySizingResult {
  fraction: number;              // optimal fractional bankroll (e.g. 0.08 = 8%)
  recommendedStakeUsdc: number;  // suggested dollar stake
  expectedValueUsdc: number;     // expected return in USDC
  expectedRoiPercent: number;    // expected ROI %
  edgePercent: number;           // perceived subjective edge %
  riskRating: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'NEGATIVE_EV';
}
