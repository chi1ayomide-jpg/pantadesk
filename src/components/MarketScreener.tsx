import React, { useState } from 'react';
import { PantaMarket } from '../types/panta';
import { Search, TrendingUp, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { analyzeMarketOdds } from '../domain/odds/odds-math';

interface MarketScreenerProps {
  markets: PantaMarket[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectMarket: (market: PantaMarket) => void;
  isLoading: boolean;
}

export const MarketScreener: React.FC<MarketScreenerProps> = ({
  markets,
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectMarket,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'yesProb' | 'spread' | 'date'>('volume');
  const [statusFilter, setStatusFilter] = useState<'all' | 'primary' | 'resolved'>('all');

  const filtered = markets
    .filter(m => {
      const matchesCat = selectedCategory === 'All' || m.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesCat && matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'volume') {
        return (b.pricing?.volume24hUsdc || 0) - (a.pricing?.volume24hUsdc || 0);
      }
      if (sortBy === 'yesProb') {
        return (b.pricing?.yesPrice || 0) - (a.pricing?.yesPrice || 0);
      }
      if (sortBy === 'spread') {
        const spreadA = Math.abs((a.pricing?.yesPrice || 0.5) + (a.pricing?.noPrice || 0.5) - 1.0);
        const spreadB = Math.abs((b.pricing?.yesPrice || 0.5) + (b.pricing?.noPrice || 0.5) - 1.0);
        return spreadB - spreadA;
      }
      return new Date(a.resolutionTime).getTime() - new Date(b.resolutionTime).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F1422] via-[#12192A] to-[#0D121F] border border-[#232D42] shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1.5 uppercase tracking-wider font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>Real-Time Market Discovery Tape</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-mono">
              Solana Prediction Markets Screener
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono">
              Continuous live order book feeds streamed via Panta Public API. Explore quantitative probability spreads, Kelly pricing efficiency, and liquidity depth.
            </p>
          </div>

          <div className="flex items-center space-x-4 shrink-0 font-mono text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-[#171F32] border border-[#232D42] text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Active Markets</span>
              <span className="text-base font-bold text-white">{markets.length}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[#171F32] border border-[#232D42] text-center">
              <span className="text-[10px] text-slate-400 uppercase block">24h Panta Vol</span>
              <span className="text-base font-bold text-cyan-400">
                ${(markets.reduce((acc, m) => acc + (m.pricing?.volume24hUsdc || 0), 0) / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
        {/* Categories Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-[#101522] text-slate-400 hover:text-slate-200 border border-[#1E2638]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search markets..."
              className="w-full bg-[#101522] border border-[#1E2638] focus:border-cyan-500 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 outline-none text-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-[#101522] border border-[#1E2638] focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-300 outline-none text-xs cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="primary">Status: Primary Open</option>
            <option value="resolved">Status: Resolved</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#101522] border border-[#1E2638] focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-300 outline-none text-xs cursor-pointer"
          >
            <option value="volume">Sort: Highest 24h Vol</option>
            <option value="yesProb">Sort: Highest YES %</option>
            <option value="spread">Sort: Spread Mispricing</option>
            <option value="date">Sort: Resolution Date</option>
          </select>
        </div>
      </div>

      {/* Markets Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Syncing Panta prediction market tape...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0D121D] border border-[#1E2638] text-slate-400 font-mono text-xs">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
          <p>No prediction markets found matching current criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(market => {
            const yesPrice = market.pricing?.yesPrice || 0.5;
            const noPrice = market.pricing?.noPrice || 0.5;
            const yesPercent = Math.round(yesPrice * 100);
            const noPercent = Math.round(noPrice * 100);
            const analysis = analyzeMarketOdds(market.marketId, yesPrice, noPrice);

            return (
              <div
                key={market.marketId}
                onClick={() => onSelectMarket(market)}
                className="bg-[#0F1422] hover:bg-[#131929] border border-[#20293D] hover:border-cyan-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-lg hover:shadow-cyan-500/5 relative"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 font-medium">
                      {market.category}
                    </span>

                    <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                      {market.status === 'resolved' ? (
                        <span className="flex items-center text-purple-400 bg-purple-950/30 px-2 py-0.5 rounded border border-purple-800/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                        </span>
                      ) : (
                        <span className="flex items-center text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span> Primary Open
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Market Title */}
                  <h3 className="text-sm font-bold text-white font-mono group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mb-2">
                    {market.title}
                  </h3>

                  {/* Description preview */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {market.description}
                  </p>
                </div>

                <div>
                  {/* Probability Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-emerald-400 font-bold flex items-center">
                        YES {yesPercent}% <span className="text-[10px] text-slate-400 ml-1">(${yesPrice.toFixed(2)})</span>
                      </span>
                      <span className="text-rose-400 font-bold flex items-center">
                        NO {noPercent}% <span className="text-[10px] text-slate-400 ml-1">(${noPrice.toFixed(2)})</span>
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#182030] overflow-hidden flex">
                      <div
                        style={{ width: `${yesPercent}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      />
                      <div
                        style={{ width: `${noPercent}%` }}
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Market Footer Metrics */}
                  <div className="pt-3 border-t border-[#1C2538] flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div>
                      <span className="block text-[9px] uppercase text-slate-400">24h Volume</span>
                      <span className="text-slate-200 font-bold">
                        ${(market.pricing?.volume24hUsdc || 0).toLocaleString()}
                      </span>
                    </div>

                    {analysis.isMispricedArbitrage && (
                      <div className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[10px]">
                        Spread: {analysis.spreadPercent.toFixed(1)}%
                      </div>
                    )}

                    <div className="flex items-center text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Trade</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
