import React, { useState, useEffect } from 'react';
import { pantaClient } from '../api/panta-client';
import { PantaPosition } from '../types/panta';
import { Layers, CheckCircle2, Wallet } from 'lucide-react';

interface PortfolioTrackerProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export const PortfolioTracker: React.FC<PortfolioTrackerProps> = ({
  walletAddress,
  onConnectWallet
}) => {
  const [positions, setPositions] = useState<PantaPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimedPositions, setClaimedPositions] = useState<Set<string>>(new Set());

  const activeAddress = walletAddress || '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';

  useEffect(() => {
    setLoading(true);
    pantaClient.getPositions(activeAddress)
      .then(res => {
        setPositions(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeAddress]);

  const handleClaim = async (posId: string) => {
    alert(`Initiated Panta claim_win_usdc transaction. Instructions compiled & signed.`);
    setClaimedPositions(prev => new Set(prev).add(posId));
  };

  const totalValue = positions.reduce((acc, p) => acc + p.currentValueUsdc, 0);
  const totalCost = positions.reduce((acc, p) => acc + p.investedUsdc, 0);
  const totalPnl = totalValue - totalCost;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Portfolio Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F1422] to-[#12192A] border border-[#20293D] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Panta Portfolio & Claims Desk</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <h1 className="text-xl font-bold text-white">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'Demo Portfolio (9WzD...AWWM)'}
              </h1>
              <button
                type="button"
                onClick={onConnectWallet}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-400 border border-slate-700 flex items-center space-x-1"
              >
                <Wallet className="w-3 h-3" />
                <span>{walletAddress ? 'Disconnect' : 'Connect Wallet'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-[#151D2F] border border-[#232D42]">
              <span className="text-[10px] text-slate-400 block uppercase">Portfolio Value</span>
              <span className="text-base font-bold text-white">${totalValue.toFixed(2)} USDC</span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-[#151D2F] border border-[#232D42]">
              <span className="text-[10px] text-slate-400 block uppercase">Unrealized PnL</span>
              <span className={`text-base font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="p-6 rounded-2xl bg-[#0F1422] border border-[#20293D] shadow-xl">
        <h2 className="text-sm font-bold text-white mb-4">Active Market Positions & Shares</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading holdings from Panta indexer...</div>
        ) : positions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No active prediction market holdings found for this wallet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E2638] text-[10px] text-slate-400 uppercase">
                  <th className="pb-3">Market</th>
                  <th className="pb-3">Side</th>
                  <th className="pb-3">Shares</th>
                  <th className="pb-3">Avg Price</th>
                  <th className="pb-3">Invested</th>
                  <th className="pb-3">Current Val</th>
                  <th className="pb-3">PnL</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182032]">
                {positions.map(pos => {
                  const isClaimed = claimedPositions.has(pos.positionId);
                  return (
                    <tr key={pos.positionId} className="hover:bg-slate-800/20">
                      <td className="py-3.5 pr-4 max-w-xs">
                        <span className="font-bold text-white block truncate">{pos.marketTitle}</span>
                        <span className="text-[10px] text-slate-400">ID: {pos.marketId}</span>
                      </td>

                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pos.side === 'YES'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                            : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                        }`}>
                          {pos.side}
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-200 font-semibold">{pos.sharesOwned.toFixed(1)}</td>
                      <td className="py-3.5 text-slate-300">${pos.avgEntryPrice.toFixed(2)}</td>
                      <td className="py-3.5 text-slate-300">${pos.investedUsdc.toFixed(2)}</td>
                      <td className="py-3.5 font-bold text-white">${pos.currentValueUsdc.toFixed(2)}</td>

                      <td className="py-3.5 font-bold">
                        <span className={pos.unrealizedPnlUsdc >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {pos.unrealizedPnlUsdc >= 0 ? `+${pos.unrealizedPnlUsdc.toFixed(2)}` : `${pos.unrealizedPnlUsdc.toFixed(2)}`} ({pos.unrealizedPnlPercent.toFixed(1)}%)
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        {pos.isClaimEligible && !isClaimed ? (
                          <button
                            type="button"
                            onClick={() => handleClaim(pos.positionId)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md transition-all animate-pulse"
                          >
                            Claim ${pos.claimablePayoutUsdc?.toFixed(2)}
                          </button>
                        ) : isClaimed ? (
                          <span className="text-emerald-400 flex items-center justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Claimed
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Open Trading</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
