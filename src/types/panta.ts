/**
 * Panta Public API v1 Data Models & Type Contracts
 * Reference: https://docs.panta.market/api-reference/
 */

export type MarketPhase = 'primary' | 'secondary' | 'resolved' | 'cancelled';

export interface PantaMarket {
  marketId: string;
  category: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: MarketPhase;
  resolutionTime: string; // ISO 8601
  createdAt: string;
  oracle: {
    source: string;
    criteria: string;
  };
  pricing?: {
    yesPrice: number;     // e.g. 0.62 USDC
    noPrice: number;      // e.g. 0.38 USDC
    impliedProbabilityYes: number; // 0.62 (62%)
    volume24hUsdc: number;
    totalLiquidityUsdc: number;
    sharesOutstandingYes: number;
    sharesOutstandingNo: number;
  };
  createdByPartner?: boolean;
}

export interface PantaMarketTrade {
  signature: string;
  marketId: string;
  wallet: string;
  side: 'YES' | 'NO';
  orderType: 'BUY' | 'SELL';
  shares: number;
  pricePerShare: number;
  amountUsdc: number;
  feeUsdc: number;
  timestamp: string;
}

export interface PantaOrderQuoteRequest {
  marketId: string;
  side: 'YES' | 'NO';
  amountUsdc: number;
  slippageTolerancePercent?: number;
}

export interface PantaOrderQuoteResponse {
  quoteId: string;
  marketId: string;
  side: 'YES' | 'NO';
  inputUsdc: number;
  expectedShares: number;
  effectivePricePerShare: number;
  priceImpactPercent: number;
  protocolFeeUsdc: number;
  creatorFeeUsdc: number;
  totalFeeUsdc: number;
  maxPayoutUsdc: number;
  potentialNetProfitUsdc: number;
  potentialRoiPercent: number;
  expiresAt: string; // ISO 8601
}

export interface PantaBuildOrderRequest {
  quoteId: string;
  userWalletPubkey: string;
}

export interface PantaBuildOrderResponse {
  unsignedTransactionBase64: string;
  recentBlockhash: string;
  lastValidBlockHeight: number;
}

export interface PantaPosition {
  positionId: string;
  marketId: string;
  marketTitle: string;
  wallet: string;
  side: 'YES' | 'NO';
  sharesOwned: number;
  avgEntryPrice: number;
  investedUsdc: number;
  currentSharePrice: number;
  currentValueUsdc: number;
  unrealizedPnlUsdc: number;
  unrealizedPnlPercent: number;
  marketStatus: MarketPhase;
  isWinningOutcome?: boolean;
  isClaimEligible: boolean;
  claimablePayoutUsdc?: number;
}

export interface PantaCreateMarketQuoteRequest {
  title: string;
  category: string;
  resolutionTime: string;
  oracleCriteria: string;
}

export interface PantaCreateMarketQuoteResponse {
  sessionId: string;
  creationFeeUsdc: number;
  rentExemptionLamports: number;
  estimatedSolFee: number;
  expiresAt: string;
}

export interface PantaApiLogEvent {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  latencyMs: number;
  requestPayload?: any;
  responsePayload?: any;
}
