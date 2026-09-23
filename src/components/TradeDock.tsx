import React, { useState, useEffect } from 'react';
import { PantaMarket, PantaOrderQuoteResponse } from '../types/panta';
import { pantaClient } from '../api/panta-client';
import { calculateKellySizing } from '../domain/odds/odds-math';
import { inspectPantaTransaction } from '../solana/tx-deserializer';
import { Zap, Sparkles, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

interface TradeDockProps {
  market: PantaMarket;
  initialSide?: 'YES' | 'NO';
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export const TradeDock: React.FC<TradeDockProps> = ({
  market,
  initialSide = 'YES',
  walletAddress,
  onConnectWallet
}) => {
  const [side, setSide] = useState<'YES' | 'NO'>(initialSide);
  const [amountUsdc, setAmountUsdc] = useState<number>(100);
  const [quote, setQuote] = useState<PantaOrderQuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState<boolean>(false);

  // Kelly Criterion settings
  const [showKelly, setShowKelly] = useState<boolean>(true);
  const [subjectiveConfidence, setSubjectiveConfidence] = useState<number>(
    initialSide === 'YES' ? 0.75 : 0.40
  );

  // Transaction building & execution state
  const [isBuildingTx, setIsBuildingTx] = useState<boolean>(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [txInspection, setTxInspection] = useState<any | null>(null);

  // Re-quote when market, side, or amount changes
  useEffect(() => {
    let isCancelled = false;
    setIsQuoting(true);

    pantaClient
      .quoteOrder({
        marketId: market.marketId,
        side,
        amountUsdc: Math.max(1, amountUsdc)
      })
      .then(res => {
        if (!isCancelled) {
          setQuote(res);
          setIsQuoting(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setIsQuoting(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [market.marketId, side, amountUsdc]);

  const currentPrice = side === 'YES'
    ? (market.pricing?.yesPrice || 0.5)
    : (market.pricing?.noPrice || 0.5);

  const kellyResult = calculateKellySizing(
    currentPrice,
    subjectiveConfidence,
    1000 // default $1000 demo bankroll
  );

  const handleExecuteTrade = async () => {
    if (!walletAddress) {
      onConnectWallet();
      return;
    }

    if (!quote) return;

    setIsBuildingTx(true);
    setTxSignature(null);
    setTxInspection(null);

    try {
      // 1. Build Unsigned Transaction from Panta API
      const buildRes = await pantaClient.buildOrder({
        quoteId: quote.quoteId,
        userWalletPubkey: walletAddress
      });

      // 2. Safely Inspect Base64 Versioned Transaction
      const inspected = inspectPantaTransaction(buildRes.unsignedTransactionBase64);
      setTxInspection({
        ...inspected,
        recentBlockhash: buildRes.recentBlockhash,
        lastValidBlockHeight: buildRes.lastValidBlockHeight
      });

      // 3. Simulate Broadcast Confirmation
      await new Promise(r => setTimeout(r, 1200));
      const mockSig = `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setTxSignature(mockSig);
    } catch (err: any) {
      alert(`Trade Execution Failed: ${err.message}`);
    } finally {
      setIsBuildingTx(false);
    }
  };

  return (
    <div className="bg-[#0F1422] border border-[#20293D] rounded-2xl p-6 shadow-xl space-y-6 font-mono text-xs">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
        <div className="flex items-center space-x-2 text-white font-bold">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Panta Order Execution Dock</span>
        </div>
        <span className="text-[10px] text-slate-400">Non-Custodial USDC Swap</span>
      </div>

      {/* Outcome Selection Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setSide('YES');
            setSubjectiveConfidence(0.75);
          }}
          className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
            side === 'YES'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/50'
              : 'bg-[#141B2D] text-emerald-400 hover:bg-[#182136] border border-[#1F293E]'
          }`}
        >
          <span className="text-sm">BUY YES</span>
          <span className="text-[10px] opacity-80">${(market.pricing?.yesPrice || 0.5).toFixed(2)} / share</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSide('NO');
            setSubjectiveConfidence(0.40);
          }}
          className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
            side === 'NO'
              ? 'bg-rose-500 text-slate-950 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-2 ring-rose-400/50'
              : 'bg-[#141B2D] text-rose-400 hover:bg-[#182136] border border-[#1F293E]'
          }`}
        >
          <span className="text-sm">BUY NO</span>
          <span className="text-[10px] opacity-80">${(market.pricing?.noPrice || 0.5).toFixed(2)} / share</span>
        </button>
      </div>

      {/* Sizing Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <label className="font-semibold">Order Sizing (USDC):</label>
          <span className="text-[10px] text-slate-400">Balance: 1,000.00 USDC</span>
        </div>

        <div className="relative">
          <input
            type="number"
            min="1"
            max="10000"
            value={amountUsdc}
            onChange={e => setAmountUsdc(Number(e.target.value))}
            className="w-full bg-[#151C2C] border border-[#232D42] focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-sm font-bold outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-xs">USDC</span>
        </div>

        {/* Quick Amount Pills */}
        <div className="flex items-center space-x-1.5 pt-1">
          {[25, 50, 100, 250, 500].map(val => (
            <button
              key={val}
              type="button"
              onClick={() => setAmountUsdc(val)}
              className={`flex-1 py-1 rounded-lg border text-[10px] transition-colors ${
                amountUsdc === val
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-[#121826] text-slate-400 hover:text-white border-[#1F283C]'
              }`}
            >
              ${val}
            </button>
          ))}
        </div>
      </div>

      {/* Quantitative Kelly Sizing Assistant */}
      <div className="p-3.5 rounded-xl bg-[#141B2D] border border-[#202A3E] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kelly Criterion Edge Sizer</span>
          </div>
          <button
            type="button"
            onClick={() => setShowKelly(!showKelly)}
            className="text-[10px] text-slate-400 hover:text-cyan-300 underline"
          >
            {showKelly ? 'Hide Sizer' : 'Show Sizer'}
          </button>
        </div>

        {showKelly && (
          <div className="space-y-3 pt-1 border-t border-[#1C2538]">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300">Your Perceived {side} Probability:</span>
                <span className="text-cyan-300 font-bold">{Math.round(subjectiveConfidence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={subjectiveConfidence}
                onChange={e => setSubjectiveConfidence(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-lg bg-[#0C111C] border border-[#1A2234]">
                <span className="text-[9px] uppercase text-slate-400 block">Recommended Stake</span>
                <span className="text-white font-bold">${kellyResult.recommendedStakeUsdc} USDC</span>
                {kellyResult.recommendedStakeUsdc > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountUsdc(kellyResult.recommendedStakeUsdc)}
                    className="text-[9px] text-cyan-400 underline block mt-0.5"
                  >
                    Apply Stake
                  </button>
                )}
              </div>

              <div className="p-2 rounded-lg bg-[#0C111C] border border-[#1A2234]">
                <span className="text-[9px] uppercase text-slate-400 block">Perceived Edge</span>
                <span className={`font-bold ${kellyResult.edgePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {kellyResult.edgePercent >= 0 ? `+${kellyResult.edgePercent.toFixed(1)}%` : `${kellyResult.edgePercent.toFixed(1)}%`}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Rating: {kellyResult.riskRating}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panta Quote Summary Table */}
      <div className="p-3.5 rounded-xl bg-[#121828] border border-[#1F293E] space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
          <span>Quote Specification</span>
          {isQuoting ? (
            <span className="flex items-center text-cyan-400"><RefreshCw className="w-3 h-3 animate-spin mr-1" /> Quoting...</span>
          ) : (
            <span className="text-emerald-400">Quote Live</span>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Expected Output:</span>
            <span className="text-white font-bold">{quote?.expectedShares.toFixed(2)} {side} Shares</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Effective Avg Price:</span>
            <span className="text-slate-200">${quote?.effectivePricePerShare.toFixed(4)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Price Impact:</span>
            <span className={`${(quote?.priceImpactPercent || 0) > 3 ? 'text-amber-400' : 'text-slate-300'}`}>
              {(quote?.priceImpactPercent || 0).toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Panta Protocol Fees:</span>
            <span className="text-slate-300">${quote?.totalFeeUsdc.toFixed(3)} USDC</span>
          </div>

          <div className="pt-2 border-t border-[#1C263A] flex justify-between font-bold">
            <span className="text-slate-300">Max Potential Payout:</span>
            <span className="text-emerald-400 text-sm">
              ${quote?.maxPayoutUsdc.toFixed(2)} USDC (+{quote?.potentialRoiPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Action Execution Button */}
      <div>
        <button
          type="button"
          disabled={isBuildingTx || isQuoting}
          onClick={handleExecuteTrade}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-98 flex items-center justify-center space-x-2"
        >
          {isBuildingTx ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Building Unsigned Solana Tx...</span>
            </>
          ) : !walletAddress ? (
            <span>Connect Wallet to Execute</span>
          ) : (
            <>
              <span>Execute {side} Order</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </div>

      {/* Deserialized Transaction Inspection Drawer */}
      {txInspection && (
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Panta Solana VersionedTx Executed!</span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Signature:</span>
              <code className="text-cyan-300">{txSignature?.slice(0, 8)}...{txSignature?.slice(-8)}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Instructions:</span>
              <span>{txInspection.numInstructions} compiled instructions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blockhash:</span>
              <code>{txInspection.recentBlockhash.slice(0, 10)}...</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
