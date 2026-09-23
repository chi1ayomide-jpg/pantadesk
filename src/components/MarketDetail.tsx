import React, { useState, useEffect } from 'react';
import { PantaMarket, PantaMarketTrade } from '../types/panta';
import { analyzeMarketOdds } from '../domain/odds/odds-math';
import { pantaClient } from '../api/panta-client';
import { ShieldCheck, Activity, Layers, Clock } from 'lucide-react';

interface MarketDetailProps {
  market: PantaMarket;
  onTradeSideSelect?: (side: 'YES' | 'NO') => void;
}

export const MarketDetail: React.FC<MarketDetailProps> = ({
  market,
  onTradeSideSelect
}) => {
  const [trades, setTrades] = useState<PantaMarketTrade[]>([]);
  const yesPrice = market.pricing?.yesPrice || 0.5;
  const noPrice = market.pricing?.noPrice || 0.5;
  const analysis = analyzeMarketOdds(market.marketId, yesPrice, noPrice);

  useEffect(() => {
    pantaClient.getMarketTrades(market.marketId).then(setTrades);
  }, [market.marketId]);

  return (
    <div className="space-y-6">
      {/* Market Header Block */}
      <div className="p-6 rounded-2xl bg-[#0F1422] border border-[#20293D] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 uppercase">
              {market.category}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ID: <code className="text-slate-300">{market.marketId}</code>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resolves: {new Date(market.resolutionTime).toLocaleDateString()}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white font-mono leading-snug mb-3">
          {market.title}
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-3xl mb-6">
          {market.description}
        </p>

        {/* Oracle Source and Criteria Box */}
        <div className="p-3.5 rounded-xl bg-[#141B2D] border border-[#222C42] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Resolution Oracle</span>
              <span className="text-slate-200 font-semibold">{market.oracle.source}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase text-slate-400 block">Resolution Criteria</span>
            <span className="text-cyan-300 font-medium">{market.oracle.criteria}</span>
          </div>
        </div>
      </div>

      {/* Probability Matrix & Odds Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#0F1422] border border-[#20293D] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Implied YES Probability</span>
            <span className="text-xl font-bold text-emerald-400">
              {(analysis.normalizedYesProb * 100).toFixed(1)}%
            </span>
          </div>
          <button
            onClick={() => onTradeSideSelect?.('YES')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold transition-all"
          >
            Buy YES ${yesPrice.toFixed(2)}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1422] border border-[#20293D] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Implied NO Probability</span>
            <span className="text-xl font-bold text-rose-400">
              {(analysis.normalizedNoProb * 100).toFixed(1)}%
            </span>
          </div>
          <button
            onClick={() => onTradeSideSelect?.('NO')}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold transition-all"
          >
            Buy NO ${noPrice.toFixed(2)}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1422] border border-[#20293D] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400">Market Spread / Rake</span>
            <span className={`text-xs font-bold ${analysis.isMispricedArbitrage ? 'text-amber-400' : 'text-slate-300'}`}>
              {analysis.spreadPercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C2538]">
            <span className="text-[10px] uppercase text-slate-400">Underdog Multiplier</span>
            <span className="text-cyan-400 font-bold">{analysis.underdogMultiplier}x</span>
          </div>
        </div>
      </div>

      {/* Probability Trajectory Visualizer */}
      <div className="p-5 rounded-2xl bg-[#0F1422] border border-[#20293D] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Probability Trajectory & Depth Curve</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Current: YES ${(yesPrice).toFixed(2)} vs NO ${(noPrice).toFixed(2)}
          </span>
        </div>

        {/* SVG Probability Curve */}
        <div className="w-full h-44 bg-[#090D15] rounded-xl p-2 border border-[#1A2234] relative">
          <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="#1F293D" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="500" y2="75" stroke="#1F293D" strokeDasharray="3 3" />
            <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="#1F293D" strokeDasharray="3 3" />

            {/* YES Curve Path */}
            <path
              d={`M 0 100 Q 150 ${120 - yesPrice * 50}, 300 ${140 - yesPrice * 80} T 500 ${150 - yesPrice * 120}`}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
            />
            {/* Area under YES curve */}
            <path
              d={`M 0 100 Q 150 ${120 - yesPrice * 50}, 300 ${140 - yesPrice * 80} T 500 ${150 - yesPrice * 120} L 500 150 L 0 150 Z`}
              fill="url(#yesGrad)"
              opacity="0.15"
            />

            {/* NO Curve Path */}
            <path
              d={`M 0 50 Q 150 ${30 + yesPrice * 50}, 300 ${10 + yesPrice * 80} T 500 ${yesPrice * 120}`}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            <defs>
              <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Markers */}
          <div className="absolute left-4 top-2 text-[10px] font-mono text-emerald-400">
            YES Prob: {Math.round(yesPrice * 100)}%
          </div>
          <div className="absolute right-4 bottom-2 text-[10px] font-mono text-rose-400">
            NO Prob: {Math.round(noPrice * 100)}%
          </div>
        </div>
      </div>

      {/* Live Market Trade Tape */}
      <div className="p-5 rounded-2xl bg-[#0F1422] border border-[#20293D]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Panta Market Trade Tape</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">On-Chain Activity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1E2638] text-[10px] text-slate-400 uppercase">
                <th className="pb-2">Side</th>
                <th className="pb-2">Shares</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Total USDC</th>
                <th className="pb-2">Wallet</th>
                <th className="pb-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">
                    No recent trade tape rows for this market.
                  </td>
                </tr>
              ) : (
                trades.map(trade => (
                  <tr key={trade.signature} className="hover:bg-slate-800/20">
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        trade.side === 'YES'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                      }`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-200">{trade.shares.toFixed(2)}</td>
                    <td className="py-2.5 text-slate-300">${trade.pricePerShare.toFixed(2)}</td>
                    <td className="py-2.5 font-bold text-white">${trade.amountUsdc.toFixed(2)}</td>
                    <td className="py-2.5 text-slate-400">
                      {trade.wallet.slice(0, 4)}...{trade.wallet.slice(-4)}
                    </td>
                    <td className="py-2.5 text-right text-slate-400 text-[11px]">{trade.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
