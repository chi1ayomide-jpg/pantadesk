import React, { useState } from 'react';
import { pantaClient } from '../api/panta-client';
import { PantaCreateMarketQuoteResponse, PantaMarket } from '../types/panta';
import { PlusCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface MarketCreatorProps {
  onMarketCreated: (market: PantaMarket) => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export const MarketCreator: React.FC<MarketCreatorProps> = ({
  onMarketCreated,
  walletAddress,
  onConnectWallet
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Crypto');
  const [description, setDescription] = useState('');
  const [resolutionDate, setResolutionDate] = useState('2026-12-31');
  const [oracleSource, setOracleSource] = useState('Coinbase / CoinGecko Official API');
  const [oracleCriteria, setOracleCriteria] = useState('Price target verified on daily close');

  const [quote, setQuote] = useState<PantaCreateMarketQuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState<PantaMarket | null>(null);

  const handleGetQuote = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in market title and description.');
      return;
    }

    setIsQuoting(true);
    try {
      const res = await pantaClient.quoteCreateMarket({
        title,
        category,
        resolutionTime: `${resolutionDate}T23:59:59Z`,
        oracleCriteria
      });
      setQuote(res);
    } catch (err: any) {
      alert(`Quote failed: ${err.message}`);
    } finally {
      setIsQuoting(false);
    }
  };

  const handleCreateMarket = async () => {
    if (!walletAddress) {
      onConnectWallet();
      return;
    }

    setIsCreating(true);
    try {
      await new Promise(r => setTimeout(r, 1400)); // Simulate Panta /markets/build/ & register

      const newMkt: PantaMarket = {
        marketId: `pnt_mkt_${Math.random().toString(36).substring(2, 9)}`,
        category,
        title,
        description,
        status: 'primary',
        resolutionTime: `${resolutionDate}T23:59:59Z`,
        createdAt: new Date().toISOString(),
        oracle: {
          source: oracleSource,
          criteria: oracleCriteria
        },
        pricing: {
          yesPrice: 0.50,
          noPrice: 0.50,
          impliedProbabilityYes: 0.50,
          volume24hUsdc: 0,
          totalLiquidityUsdc: 1000,
          sharesOutstandingYes: 1000,
          sharesOutstandingNo: 1000
        },
        createdByPartner: true
      };

      pantaClient.registerLocalMarket(newMkt);
      onMarketCreated(newMkt);
      setCreatedSuccess(newMkt);
    } catch (err: any) {
      alert(`Creation error: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F1422] to-[#12192A] border border-[#20293D] shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Panta Market Creator Studio</h1>
            <p className="text-xs text-slate-400">Launch permissionless prediction markets natively on Solana</p>
          </div>
        </div>
      </div>

      {createdSuccess ? (
        <div className="p-8 rounded-2xl bg-[#0F1422] border border-emerald-500/40 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Prediction Market Initialized Successfully!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Market ID <code className="text-cyan-300">{createdSuccess.marketId}</code> is now registered in the Panta catalog and ready for primary trading.
          </p>
          <button
            type="button"
            onClick={() => setCreatedSuccess(null)}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
          >
            Create Another Market
          </button>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#0F1422] border border-[#20293D] space-y-5">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Market Question / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Will Solana break all-time high against ETH in Q4 2026?"
                className="w-full bg-[#151C2C] border border-[#232D42] focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#151C2C] border border-[#232D42] focus:border-cyan-500 rounded-xl px-3 py-2.5 text-white text-xs outline-none"
                >
                  <option value="Crypto">Crypto</option>
                  <option value="Macro">Macro</option>
                  <option value="AI & Tech">AI & Tech</option>
                  <option value="Politics">Politics</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resolution Date *</label>
                <input
                  type="date"
                  value={resolutionDate}
                  onChange={e => setResolutionDate(e.target.value)}
                  className="w-full bg-[#151C2C] border border-[#232D42] focus:border-cyan-500 rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Detailed Resolution Rules & Scope *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Specify precise conditions for YES vs NO outcome resolution..."
                className="w-full bg-[#151C2C] border border-[#232D42] focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Oracle Data Source</label>
                <input
                  type="text"
                  value={oracleSource}
                  onChange={e => setOracleSource(e.target.value)}
                  className="w-full bg-[#151C2C] border border-[#232D42] focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resolution Metric</label>
                <input
                  type="text"
                  value={oracleCriteria}
                  onChange={e => setOracleCriteria(e.target.value)}
                  className="w-full bg-[#151C2C] border border-[#232D42] focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Creation Fee Quote Box */}
          {quote ? (
            <div className="p-4 rounded-xl bg-[#141B2D] border border-cyan-500/30 space-y-2">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block">Panta Creation Quote</span>
              <div className="flex justify-between text-slate-300">
                <span>Panta Protocol Creation Fee:</span>
                <span className="text-white font-bold">${quote.creationFeeUsdc.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Solana Account Rent Exemption:</span>
                <span className="text-slate-200">~{quote.estimatedSolFee} SOL</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isQuoting}
              onClick={handleGetQuote}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all border border-slate-700 flex items-center justify-center space-x-1.5"
            >
              {isQuoting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Requesting Fee Quote from Panta...</span>
                </>
              ) : (
                <span>Request Panta Creation Quote</span>
              )}
            </button>
          )}

          {/* Submit Button */}
          {quote && (
            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreateMarket}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Building Unsigned Initialization Tx...</span>
                </>
              ) : (
                <span>Launch Market on Solana ({quote.creationFeeUsdc} USDC)</span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
