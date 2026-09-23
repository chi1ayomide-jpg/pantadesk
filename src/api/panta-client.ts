import {
  PantaMarket,
  PantaMarketTrade,
  PantaOrderQuoteRequest,
  PantaOrderQuoteResponse,
  PantaBuildOrderRequest,
  PantaBuildOrderResponse,
  PantaPosition,
  PantaCreateMarketQuoteRequest,
  PantaCreateMarketQuoteResponse,
  PantaApiLogEvent
} from '../types/panta';
import { DEMO_MARKETS, DEMO_TRADES, DEMO_POSITIONS, PANTA_CATEGORIES } from './demo-catalog';
import { estimateTradeOutput } from '../domain/odds/odds-math';

export type LogListener = (event: PantaApiLogEvent) => void;

export class PantaClient {
  private baseUrl = 'https://live-api.panta.market/api/v1';
  private apiKey: string | null = null;
  private logListeners: Set<LogListener> = new Set();
  private marketsCache: PantaMarket[] = [...DEMO_MARKETS];

  constructor(apiKey?: string) {
    if (apiKey) this.apiKey = apiKey;
  }

  setApiKey(key: string | null) {
    this.apiKey = key;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  onLog(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  private emitLog(event: PantaApiLogEvent) {
    this.logListeners.forEach(listener => listener(event));
  }

  private async fetchPanta<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const startTime = performance.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.apiKey) {
      headers['X-Api-Key'] = this.apiKey;
    }

    const fullUrl = `${this.baseUrl}${endpoint.endsWith('/') ? endpoint : endpoint + '/'}`;
    const method = (options.method || 'GET') as PantaApiLogEvent['method'];

    try {
      if (!this.apiKey) {
        // When no API key is provided, we simulate response seamlessly from demo cache
        // but log the event so the developer console shows the exact Panta interaction!
        await new Promise(r => setTimeout(r, 60)); // realistic latency
        const latencyMs = Math.round(performance.now() - startTime);

        this.emitLog({
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          method,
          endpoint,
          status: 200,
          latencyMs,
          requestPayload: options.body ? JSON.parse(options.body as string) : undefined,
          responsePayload: { simulated: true }
        });

        return null as unknown as T;
      }

      const res = await fetch(fullUrl, {
        ...options,
        headers
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const data = await res.json();

      this.emitLog({
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        status: res.status,
        latencyMs,
        requestPayload: options.body ? JSON.parse(options.body as string) : undefined,
        responsePayload: data
      });

      if (!res.ok) {
        throw new Error(data.message || `Panta API error ${res.status}: ${data.code || 'UNKNOWN'}`);
      }

      return data as T;
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      this.emitLog({
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        status: 500,
        latencyMs,
        requestPayload: options.body ? JSON.parse(options.body as string) : undefined,
        responsePayload: { error: err.message }
      });
      throw err;
    }
  }

  // 1. Get Categories
  async getCategories(): Promise<string[]> {
    try {
      const res = await this.fetchPanta<{ items: string[] }>('/categories/');
      return res?.items || PANTA_CATEGORIES;
    } catch {
      return PANTA_CATEGORIES;
    }
  }

  // 2. List Markets
  async listMarkets(category?: string, status?: string): Promise<PantaMarket[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (status) params.set('status', status);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await this.fetchPanta<{ items: PantaMarket[] }>(`/markets/${qs}`);
      if (res?.items && Array.isArray(res.items)) {
        return res.items;
      }
    } catch {
      // Fallback to cache
    }

    let results = [...this.marketsCache];
    if (category && category !== 'All') {
      results = results.filter(m => m.category.toLowerCase() === category.toLowerCase());
    }
    if (status) {
      results = results.filter(m => m.status === status);
    }
    return results;
  }

  // 3. Get Single Market
  async getMarket(marketId: string): Promise<PantaMarket | null> {
    try {
      const res = await this.fetchPanta<PantaMarket>(`/markets/${marketId}/`);
      if (res) return res;
    } catch {
      // fallback
    }
    return this.marketsCache.find(m => m.marketId === marketId) || null;
  }

  // 4. Get Market Trades
  async getMarketTrades(marketId: string): Promise<PantaMarketTrade[]> {
    try {
      const res = await this.fetchPanta<{ items: PantaMarketTrade[] }>(`/markets/${marketId}/trades/`);
      if (res?.items) return res.items;
    } catch {
      // fallback
    }
    return DEMO_TRADES.filter(t => t.marketId === marketId);
  }

  // 5. Quote Primary Order
  async quoteOrder(req: PantaOrderQuoteRequest): Promise<PantaOrderQuoteResponse> {
    const market = await this.getMarket(req.marketId);
    const currentPrice = req.side === 'YES' ? (market?.pricing?.yesPrice || 0.5) : (market?.pricing?.noPrice || 0.5);

    try {
      const liveRes = await this.fetchPanta<PantaOrderQuoteResponse>('/orders/quote/', {
        method: 'POST',
        body: JSON.stringify(req)
      });
      if (liveRes) return liveRes;
    } catch {
      // fallback
    }

    const calculated = estimateTradeOutput(
      req.amountUsdc,
      req.side,
      currentPrice,
      req.slippageTolerancePercent || 0.5
    );

    return {
      quoteId: `qte_${Math.random().toString(36).substring(2, 10)}`,
      marketId: req.marketId,
      side: req.side,
      inputUsdc: calculated.inputUsdc,
      expectedShares: calculated.expectedShares,
      effectivePricePerShare: calculated.effectivePrice,
      priceImpactPercent: calculated.priceImpactPercent,
      protocolFeeUsdc: calculated.protocolFeeUsdc,
      creatorFeeUsdc: calculated.creatorFeeUsdc,
      totalFeeUsdc: calculated.totalFeeUsdc,
      maxPayoutUsdc: calculated.maxPayoutUsdc,
      potentialNetProfitUsdc: calculated.potentialNetProfitUsdc,
      potentialRoiPercent: calculated.potentialRoiPercent,
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    };
  }

  // 6. Build Primary Order (Unsigned Transaction)
  async buildOrder(req: PantaBuildOrderRequest): Promise<PantaBuildOrderResponse> {
    try {
      const liveRes = await this.fetchPanta<PantaBuildOrderResponse>('/orders/build/', {
        method: 'POST',
        body: JSON.stringify(req)
      });
      if (liveRes) return liveRes;
    } catch {
      // fallback
    }

    // Mock an authentic versioned transaction format
    return {
      unsignedTransactionBase64: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAED...',
      recentBlockhash: 'GfT9XWq2k8rY7m5V1n4P9z2M8x3L7p5J4w1R6t8Y',
      lastValidBlockHeight: 284192040
    };
  }

  // 7. List Positions for a Wallet
  async getPositions(walletPubkey: string): Promise<PantaPosition[]> {
    try {
      const res = await this.fetchPanta<{ items: PantaPosition[] }>(`/positions/?wallet=${walletPubkey}`);
      if (res?.items) return res.items;
    } catch {
      // fallback
    }
    return DEMO_POSITIONS;
  }

  // 8. Quote Market Creation
  async quoteCreateMarket(req: PantaCreateMarketQuoteRequest): Promise<PantaCreateMarketQuoteResponse> {
    try {
      const res = await this.fetchPanta<PantaCreateMarketQuoteResponse>('/markets/quote/', {
        method: 'POST',
        body: JSON.stringify(req)
      });
      if (res) return res;
    } catch {
      // fallback
    }

    return {
      sessionId: `ses_${Math.random().toString(36).substring(2, 9)}`,
      creationFeeUsdc: 15.00,
      rentExemptionLamports: 2039280,
      estimatedSolFee: 0.005,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString()
    };
  }

  // 9. Register Newly Created Market in local cache
  registerLocalMarket(newMarket: PantaMarket) {
    this.marketsCache.unshift(newMarket);
  }
}

export const pantaClient = new PantaClient();
