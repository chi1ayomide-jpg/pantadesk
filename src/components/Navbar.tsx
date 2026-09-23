import { Terminal, Key, Wallet, PlusCircle, BarChart3, Layers, Compass } from 'lucide-react';

interface NavbarProps {
  activeTab: 'screener' | 'trade' | 'creator' | 'portfolio' | 'console';
  setActiveTab: (tab: 'screener' | 'trade' | 'creator' | 'portfolio' | 'console') => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  apiLogCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  walletAddress,
  onConnectWallet,
  hasApiKey,
  onOpenApiKeyModal,
  apiLogCount
}) => {
  return (
    <header className="border-b border-[#232D42] bg-[#0A0E17]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              🔮
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-wider text-white font-mono">PANTA<span className="text-cyan-400">DESK</span></span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                  Terminal v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Panta API v1 • Solana Mainnet</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#101624] p-1 rounded-xl border border-[#1E2638]">
            <button
              onClick={() => setActiveTab('screener')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'screener'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Screener</span>
            </button>

            <button
              onClick={() => setActiveTab('trade')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'trade'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Trade & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('creator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'creator'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Creator Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </button>

            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all relative ${
                activeTab === 'console'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>API Console</span>
              {apiLogCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                  {apiLogCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* API Key Modal Button */}
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                hasApiKey
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-amber-950/30 border-amber-600/40 text-amber-300 hover:bg-amber-900/40'
              }`}
              title={hasApiKey ? 'Live Panta API Key Active' : 'Operating in Sandbox / Demo Mode'}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{hasApiKey ? 'pk_live' : 'Sandbox Key'}</span>
            </button>

            {/* Wallet Button */}
            <button
              onClick={onConnectWallet}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
