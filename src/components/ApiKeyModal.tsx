import React, { useState } from 'react';
import { Key, X, CheckCircle2, Shield, HelpCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string | null;
  onSaveKey: (key: string | null) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey
}) => {
  const [inputVal, setInputVal] = useState(currentKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleaned = inputVal.trim();
    onSaveKey(cleaned ? cleaned : null);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputVal('');
    onSaveKey(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F1420] border border-[#232D42] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono">Panta API Configuration</h3>
            <p className="text-xs text-slate-400">Authenticate with Panta's Native Solana Prediction Market Engine</p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold">
              Panta API Key (<span className="text-cyan-400">pk_live_...</span> or <span className="text-cyan-400">pk_test_...</span>)
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="e.g. pk_live_9f8e7d6c5b4a3..."
              className="w-full bg-[#151C2C] border border-[#232D42] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Keys are stored strictly in client-side memory. Never sent to third parties.</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-slate-300 space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to get a Panta API Key:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1. Register at <code className="text-cyan-300">live-api.panta.market/api/v1/auth/register/</code><br />
              2. Mint an API key via <code className="text-cyan-300">/api/v1/account/keys/</code><br />
              3. Or leave blank to use the built-in <strong>Live Sandbox Feed</strong>!
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-slate-400 hover:text-rose-400 text-xs transition-colors"
            >
              Reset to Sandbox Mode
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    <span>Configured!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
