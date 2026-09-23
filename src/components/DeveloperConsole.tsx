import React, { useState } from 'react';
import { PantaApiLogEvent } from '../types/panta';
import { Terminal, Trash2, ArrowUpRight, Copy, CheckCircle2 } from 'lucide-react';

interface DeveloperConsoleProps {
  logs: PantaApiLogEvent[];
  onClearLogs: () => void;
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({
  logs,
  onClearLogs
}) => {
  const [selectedLog, setSelectedLog] = useState<PantaApiLogEvent | null>(logs[0] || null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 800);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0F1422] border border-[#20293D] shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Panta Developer Inspection Console</h1>
            <p className="text-xs text-slate-400">Real-time tracing of Panta Public REST API v1 payloads, latency, and status</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearLogs}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Clear Tape</span>
        </button>
      </div>

      {/* Console Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tape List */}
        <div className="lg:col-span-5 bg-[#0F1422] border border-[#20293D] rounded-2xl p-4 shadow-xl space-y-2 max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2638] text-[10px] text-slate-400 uppercase font-semibold">
            <span>Captured Requests ({logs.length})</span>
            <span>Target: live-api.panta.market</span>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No API events recorded yet. Perform an action to stream events.
            </div>
          ) : (
            logs.map(log => {
              const isSelected = selectedLog?.id === log.id;
              const isSuccess = log.status >= 200 && log.status < 300;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/40 shadow-sm'
                      : 'bg-[#131929] border-[#1C2538] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                        log.method === 'GET'
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      }`}>
                        {log.method}
                      </span>
                      <code className="text-white text-xs font-bold truncate max-w-[180px]">
                        {log.endpoint}
                      </code>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSuccess
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-cyan-400">{log.latencyMs} ms</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right JSON Payload Viewer */}
        <div className="lg:col-span-7 bg-[#0F1422] border border-[#20293D] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2638] mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Inspector:</span>
                <code className="text-cyan-400 text-xs font-bold">{selectedLog?.endpoint || 'Select an event'}</code>
              </div>

              {selectedLog && (
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2))}
                  className="flex items-center space-x-1 text-slate-400 hover:text-white text-[11px]"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {selectedLog ? (
              <div className="space-y-4">
                {selectedLog.requestPayload && (
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                      Request Body (Outbound to Panta)
                    </span>
                    <pre className="p-3.5 rounded-xl bg-[#080B11] border border-[#1A2234] text-cyan-300 text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                      {JSON.stringify(selectedLog.requestPayload, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                    Response Envelope (Inbound from Panta)
                  </span>
                  <pre className="p-3.5 rounded-xl bg-[#080B11] border border-[#1A2234] text-emerald-300 text-[11px] overflow-x-auto max-h-64 leading-relaxed">
                    {JSON.stringify(selectedLog.responsePayload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                Click any request in the left stream to inspect the exact payload.
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-[#1C2538] flex items-center justify-between text-[11px] text-slate-400">
            <span>Official Docs: <code className="text-cyan-400">docs.panta.market</code></span>
            <a
              href="https://docs.panta.market/"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>API Reference</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
