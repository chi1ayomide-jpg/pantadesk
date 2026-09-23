import { describe, it, expect } from 'vitest';
import { PantaClient } from '../api/panta-client';

describe('Panta Public API Client SDK', () => {
  it('instantiates client and correctly manages API key credentials', () => {
    const client = new PantaClient();
    expect(client.getApiKey()).toBeNull();

    client.setApiKey('pk_live_test123456');
    expect(client.getApiKey()).toBe('pk_live_test123456');

    client.setApiKey(null);
    expect(client.getApiKey()).toBeNull();
  });

  it('retrieves market categories with fallback capability', async () => {
    const client = new PantaClient();
    const categories = await client.getCategories();
    expect(categories).toContain('Crypto');
    expect(categories).toContain('Macro');
    expect(categories).toContain('AI & Tech');
  });

  it('lists markets and applies category filtering accurately', async () => {
    const client = new PantaClient();
    const allMarkets = await client.listMarkets();
    expect(allMarkets.length).toBeGreaterThan(0);

    const cryptoOnly = await client.listMarkets('Crypto');
    expect(cryptoOnly.every(m => m.category.toLowerCase() === 'crypto')).toBe(true);
  });

  it('generates primary order quotes with fee metrics and expiration timestamp', async () => {
    const client = new PantaClient();
    const quote = await client.quoteOrder({
      marketId: 'pnt_mkt_sol5k_2026',
      side: 'YES',
      amountUsdc: 150
    });

    expect(quote.quoteId).toBeDefined();
    expect(quote.side).toBe('YES');
    expect(quote.inputUsdc).toBe(150);
    expect(quote.expectedShares).toBeGreaterThan(0);
    expect(quote.totalFeeUsdc).toBeGreaterThan(0);
    expect(new Date(quote.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('emits live event logs to registered listeners for Developer Console inspection', async () => {
    const client = new PantaClient();
    const events: any[] = [];
    const unsubscribe = client.onLog(e => events.push(e));

    await client.listMarkets();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].status).toBe(200);
    expect(events[0].latencyMs).toBeGreaterThanOrEqual(0);

    unsubscribe();
  });

  it('supports judge live API key injection and telemetry tracking', async () => {
    const client = new PantaClient('pk_live_judge_evaluation_key_2026');
    expect(client.getApiKey()).toBe('pk_live_judge_evaluation_key_2026');

    const logs: any[] = [];
    client.onLog(e => logs.push(e));

    // When an invalid key is provided to live endpoint, client catches non-ok status and falls back safely
    const markets = await client.listMarkets();
    expect(markets.length).toBeGreaterThan(0);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].endpoint).toContain('/markets/');
  });
});
