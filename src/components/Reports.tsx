import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface Log {
  id: number;
  type: 'IN' | 'OUT' | 'ADJUST';
  sku: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  createdAt: string;
}

export default function Reports() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'audit' | 'transactions'>('transactions');

  useEffect(() => {
    Promise.all([
      fetch('/api/logs').then(res => res.json()),
      fetch('/api/transactions').then(res => res.json())
    ]).then(([logsData, transData]) => {
      setLogs(logsData);
      // Requirement: Report hanya bisa di lihat ketika process Done
      setTransactions(transData.filter((t: any) => t.status === 'DONE'));
      setLoading(false);
    });
  }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDownLeft size={14} className="text-green-600" />;
      case 'OUT': return <ArrowUpRight size={14} className="text-red-600" />;
      default: return <RefreshCw size={14} className="text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic">Inventory Reports</h2>
          <p className="text-xs opacity-50 uppercase tracking-wider">Transaction Summary & Audit History</p>
        </div>
        <div className="flex border border-[#141414]">
          <button 
            onClick={() => setView('transactions')}
            className={cn(
              "px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors",
              view === 'transactions' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
            )}
          >
            Done Transactions
          </button>
          <button 
            onClick={() => setView('audit')}
            className={cn(
              "px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors",
              view === 'audit' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
            )}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {view === 'transactions' ? (
        <div className="border border-[#141414] overflow-hidden">
          <div className="grid grid-cols-[150px_80px_100px_1fr_1fr_100px] bg-[#141414] text-[#E4E3E0] p-3 text-[10px] uppercase tracking-widest font-bold">
            <div>Timestamp</div>
            <div>Type</div>
            <div>SKU</div>
            <div>Customer</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">Status</div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center opacity-30 italic text-sm">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center opacity-30 italic text-sm">No completed transactions found.</div>
          ) : (
            transactions.map((t) => (
              <div 
                key={t.id}
                className="grid grid-cols-[150px_80px_100px_1fr_1fr_100px] p-4 border-t border-[#141414] text-xs items-center hover:bg-[#141414]/5 transition-colors"
              >
                <div className="font-mono opacity-50">
                  {t.createdAt ? format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                </div>
                <div className={cn("font-bold", t.type === 'IN' ? "text-green-600" : "text-red-600")}>
                  {t.type}
                </div>
                <div className="font-mono">{t.sku}</div>
                <div className="opacity-70">{t.customer || '-'}</div>
                <div className="text-right font-mono font-bold">
                  {t.type === 'IN' ? '+' : '-'}{t.quantity}
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-[9px] font-bold uppercase">
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="border border-[#141414] overflow-hidden">
          <div className="grid grid-cols-[150px_80px_100px_1fr_100px_100px] bg-[#141414] text-[#E4E3E0] p-3 text-[10px] uppercase tracking-widest font-bold">
            <div>Timestamp</div>
            <div>Type</div>
            <div>SKU</div>
            <div>Description</div>
            <div className="text-center">Prev. Stock</div>
            <div className="text-center">New Stock</div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center opacity-30 italic text-sm">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center opacity-30 italic text-sm">No logs recorded yet.</div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id}
                className="grid grid-cols-[150px_80px_100px_1fr_100px_100px] p-4 border-t border-[#141414] text-xs items-center hover:bg-[#141414]/5 transition-colors"
              >
                <div className="font-mono opacity-50">
                  {log.createdAt ? format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'Pending...'}
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  {getLogIcon(log.type)}
                  {log.type}
                </div>
                <div className="font-mono">{log.sku}</div>
                <div className="italic opacity-70">
                  {log.type === 'IN' && `Received ${log.quantity} units`}
                  {log.type === 'OUT' && `Shipped ${log.quantity} units`}
                  {log.type === 'ADJUST' && `Manual adjustment of ${log.quantity} units`}
                </div>
                <div className="text-center font-mono">{log.previousStock}</div>
                <div className="text-center font-mono font-bold">{log.newStock}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
