import React, { useState, useEffect } from 'react';
import { pantaClient } from './api/panta-client';
import { PantaMarket, PantaApiLogEvent } from './types/panta';
import { Navbar } from './components/Navbar';
import { MarketScreener } from './components/MarketScreener';
import { MarketDetail } from './components/MarketDetail';
import { TradeDock } from './components/TradeDock';
import { MarketCreator } from './components/MarketCreator';
import { PortfolioTracker } from './components/PortfolioTracker';
import { DeveloperConsole } from './components/DeveloperConsole';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DEMO_MARKETS, PANTA_CATEGORIES } from './api/demo-catalog';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'screener' | 'trade' | 'creator' | 'portfolio' | 'console'>('screener');
  const [markets, setMarkets] = useState<PantaMarket[]>(DEMO_MARKETS);
  const [categories, setCategories] = useState<string[]>(PANTA_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMarket, setSelectedMarket] = useState<PantaMarket>(DEMO_MARKETS[0]);
  const [selectedTradeSide, setSelectedTradeSide] = useState<'YES' | 'NO'>('YES');

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<PantaApiLogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to Panta Client real-time log events
  useEffect(() => {
    const unsubscribe = pantaClient.onLog(event => {
      setApiLogs(prev => [event, ...prev].slice(0, 100)); // maintain latest 100
    });
    return unsubscribe;
  }, []);

  // Fetch initial markets
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      pantaClient.getCategories(),
      pantaClient.listMarkets()
    ]).then(([cats, mkts]) => {
      setCategories(cats);
      setMarkets(mkts);
      if (mkts.length > 0) setSelectedMarket(mkts[0]);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [apiKey]);

  const handleConnectWallet = () => {
    if (walletAddress) {
      setWalletAddress(null);
    } else {
      setWalletAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
    }
  };

  const handleSaveApiKey = (key: string | null) => {
    setApiKey(key);
    pantaClient.setApiKey(key);
  };

  const handleSelectMarket = (mkt: PantaMarket) => {
    setSelectedMarket(mkt);
    setActiveTab('trade');
  };

  const handleTradeSideSelect = (side: 'YES' | 'NO') => {
    setSelectedTradeSide(side);
  };

  const handleMarketCreated = (newMkt: PantaMarket) => {
    setMarkets(prev => [newMkt, ...prev]);
    setSelectedMarket(newMkt);
    setActiveTab('trade');
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        hasApiKey={Boolean(apiKey)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        apiLogCount={apiLogs.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'screener' && (
          <MarketScreener
            markets={markets}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectMarket={handleSelectMarket}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'trade' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <MarketDetail
                market={selectedMarket}
                onTradeSideSelect={handleTradeSideSelect}
              />
            </div>
            <div className="lg:col-span-5 sticky top-24">
              <TradeDock
                market={selectedMarket}
                initialSide={selectedTradeSide}
                walletAddress={walletAddress}
                onConnectWallet={handleConnectWallet}
              />
            </div>
          </div>
        )}

        {activeTab === 'creator' && (
          <MarketCreator
            onMarketCreated={handleMarketCreated}
            walletAddress={walletAddress}
            onConnectWallet={handleConnectWallet}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioTracker
            walletAddress={walletAddress}
            onConnectWallet={handleConnectWallet}
          />
        )}

        {activeTab === 'console' && (
          <DeveloperConsole
            logs={apiLogs}
            onClearLogs={() => setApiLogs([])}
          />
        )}
      </main>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      <footer className="border-t border-[#1C2538] bg-[#0A0E17] py-6 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">PANTA<span className="text-cyan-400">DESK</span></span>
            <span>• Built for the Colosseum Crypto World's Fair Panta Hackathon Track</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://docs.panta.market" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              Panta Docs
            </a>
            <a href="https://panta.market" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              Panta Mainnet
            </a>
            <a href="https://superteam.fun" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              Superteam Earn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
