import { PantaMarket, PantaMarketTrade, PantaPosition } from '../types/panta';

export const PANTA_CATEGORIES = [
  'All',
  'Crypto',
  'Macro',
  'AI & Tech',
  'Politics',
  'Sports'
];

export const DEMO_MARKETS: PantaMarket[] = [
  {
    marketId: 'pnt_mkt_sol5k_2026',
    category: 'Crypto',
    title: 'Will Solana mainnet exceed 5,000 true TPS before December 2026?',
    description: 'Resolves YES if Solana mainnet sustains >= 5,000 non-vote transactions per second for over 60 consecutive seconds as measured by SolanaFM / Solscan before Dec 31, 2026.',
    status: 'primary',
    resolutionTime: '2026-12-31T23:59:59Z',
    createdAt: '2026-09-01T12:00:00Z',
    oracle: {
      source: 'Solana Foundation / Solscan Metric Tape',
      criteria: 'Non-vote TPS sustained threshold >= 5,000'
    },
    pricing: {
      yesPrice: 0.68,
      noPrice: 0.32,
      impliedProbabilityYes: 0.68,
      volume24hUsdc: 245900,
      totalLiquidityUsdc: 780000,
      sharesOutstandingYes: 450000,
      sharesOutstandingNo: 330000
    }
  },
  {
    marketId: 'pnt_mkt_fedrate_nov26',
    category: 'Macro',
    title: 'Will the Federal Reserve cut interest rates by >= 25 bps in November 2026?',
    description: 'Resolves YES if the FOMC announces an interest rate reduction of at least 25 basis points at the conclusion of their November 2026 meeting.',
    status: 'primary',
    resolutionTime: '2026-11-06T19:00:00Z',
    createdAt: '2026-09-10T14:30:00Z',
    oracle: {
      source: 'Federal Reserve Board Official Statement',
      criteria: 'Federal Funds target range decreased by at least 0.25%'
    },
    pricing: {
      yesPrice: 0.74,
      noPrice: 0.26,
      impliedProbabilityYes: 0.74,
      volume24hUsdc: 412000,
      totalLiquidityUsdc: 1250000,
      sharesOutstandingYes: 620000,
      sharesOutstandingNo: 210000
    }
  },
  {
    marketId: 'pnt_mkt_btc150k_q4',
    category: 'Crypto',
    title: 'Will Bitcoin trade at or above $150,000 on Coinbase before year-end 2026?',
    description: 'Resolves YES if BTC-USD prints at least one print at or above $150,000.00 on the Coinbase spot orderbook prior to midnight UTC on December 31, 2026.',
    status: 'primary',
    resolutionTime: '2026-12-31T23:59:59Z',
    createdAt: '2026-08-20T09:00:00Z',
    oracle: {
      source: 'Coinbase Spot API (BTC-USD)',
      criteria: 'High price trade >= $150,000.00'
    },
    pricing: {
      yesPrice: 0.42,
      noPrice: 0.58,
      impliedProbabilityYes: 0.42,
      volume24hUsdc: 1840000,
      totalLiquidityUsdc: 3950000,
      sharesOutstandingYes: 980000,
      sharesOutstandingNo: 1350000
    }
  },
  {
    marketId: 'pnt_mkt_claude_swe',
    category: 'AI & Tech',
    title: 'Will an AI agent score >= 90% on SWE-bench Verified before Dec 2026?',
    description: 'Resolves YES if an autonomous AI coding agent officially submits and verifies a score of 90.0% or greater on the official SWE-bench Verified benchmark leaderboard.',
    status: 'primary',
    resolutionTime: '2026-12-31T23:59:59Z',
    createdAt: '2026-09-05T16:00:00Z',
    oracle: {
      source: 'SWE-bench Official Leaderboard',
      criteria: 'Verified solve rate >= 90.0%'
    },
    pricing: {
      yesPrice: 0.81,
      noPrice: 0.19,
      impliedProbabilityYes: 0.81,
      volume24hUsdc: 310500,
      totalLiquidityUsdc: 920000,
      sharesOutstandingYes: 540000,
      sharesOutstandingNo: 125000
    }
  },
  {
    marketId: 'pnt_mkt_worldcup_qual',
    category: 'Sports',
    title: 'Will Nigeria qualify for the 2026 FIFA World Cup Round of 16?',
    description: 'Resolves YES if the Nigerian Super Eagles national team officially advances to the round of 16 in the FIFA 2026 tournament.',
    status: 'primary',
    resolutionTime: '2026-06-30T23:59:59Z',
    createdAt: '2026-09-15T11:00:00Z',
    oracle: {
      source: 'FIFA Official Match Reports',
      criteria: 'Advanced to Round of 16'
    },
    pricing: {
      yesPrice: 0.35,
      noPrice: 0.65,
      impliedProbabilityYes: 0.35,
      volume24hUsdc: 180200,
      totalLiquidityUsdc: 510000,
      sharesOutstandingYes: 210000,
      sharesOutstandingNo: 390000
    }
  },
  {
    marketId: 'pnt_mkt_spacex_starship',
    category: 'AI & Tech',
    title: 'Will SpaceX successfully catch both Super Heavy and Starship in single flight?',
    description: 'Resolves YES if SpaceX performs a successful tower catch of both the booster and the upper stage Starship in the same integrated test flight.',
    status: 'resolved',
    resolutionTime: '2026-08-30T18:00:00Z',
    createdAt: '2026-07-01T10:00:00Z',
    oracle: {
      source: 'SpaceX Official Flight Telemetry',
      criteria: 'Dual tower catch confirmed'
    },
    pricing: {
      yesPrice: 1.00,
      noPrice: 0.00,
      impliedProbabilityYes: 1.00,
      volume24hUsdc: 0,
      totalLiquidityUsdc: 450000,
      sharesOutstandingYes: 450000,
      sharesOutstandingNo: 0
    }
  }
];

export const DEMO_TRADES: PantaMarketTrade[] = [
  {
    signature: '5xK9bJ1Zq2M9yL3P4w7R8t1V3n6Y5m8K2p4X7z9W1q4',
    marketId: 'pnt_mkt_sol5k_2026',
    wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    side: 'YES',
    orderType: 'BUY',
    shares: 1470.58,
    pricePerShare: 0.68,
    amountUsdc: 1000.0,
    feeUsdc: 15.0,
    timestamp: '2 mins ago'
  },
  {
    signature: '3hN4rP8kL1m2W9v5Z7y3X8t2V6m4Q9p1J3x7K2z9R8w',
    marketId: 'pnt_mkt_sol5k_2026',
    wallet: '7XqP2bBmkZ8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtBLKM',
    side: 'NO',
    orderType: 'BUY',
    shares: 781.25,
    pricePerShare: 0.32,
    amountUsdc: 250.0,
    feeUsdc: 3.75,
    timestamp: '7 mins ago'
  },
  {
    signature: '2mV8tX9zK3p4W1q7Y5m8R2t4V6m1L3P4w7N9y1J3x7K',
    marketId: 'pnt_mkt_btc150k_q4',
    wallet: '4JzK8bBmkZ8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtXOPQ',
    side: 'YES',
    orderType: 'BUY',
    shares: 4761.9,
    pricePerShare: 0.42,
    amountUsdc: 2000.0,
    feeUsdc: 30.0,
    timestamp: '14 mins ago'
  }
];

export const DEMO_POSITIONS: PantaPosition[] = [
  {
    positionId: 'pos_01',
    marketId: 'pnt_mkt_sol5k_2026',
    marketTitle: 'Will Solana mainnet exceed 5,000 true TPS before December 2026?',
    wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    side: 'YES',
    sharesOwned: 1250,
    avgEntryPrice: 0.55,
    investedUsdc: 687.5,
    currentSharePrice: 0.68,
    currentValueUsdc: 850.0,
    unrealizedPnlUsdc: 162.5,
    unrealizedPnlPercent: 23.63,
    marketStatus: 'primary',
    isClaimEligible: false
  },
  {
    positionId: 'pos_02',
    marketId: 'pnt_mkt_spacex_starship',
    marketTitle: 'Will SpaceX successfully catch both Super Heavy and Starship in single flight?',
    wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    side: 'YES',
    sharesOwned: 500,
    avgEntryPrice: 0.70,
    investedUsdc: 350.0,
    currentSharePrice: 1.00,
    currentValueUsdc: 500.0,
    unrealizedPnlUsdc: 150.0,
    unrealizedPnlPercent: 42.85,
    marketStatus: 'resolved',
    isWinningOutcome: true,
    isClaimEligible: true,
    claimablePayoutUsdc: 500.0
  }
];
