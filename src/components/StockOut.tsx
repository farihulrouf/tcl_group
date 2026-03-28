import React, { useState } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { Plus, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function StockOut() {
  const { products, transactions, createStockOut, updateStockOutStatus } = useInventoryStore();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stockOutTransactions = transactions.filter(t => t.type === 'OUT');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE': return <CheckCircle2 size={14} className="text-green-600" />;
      case 'CANCELLED': return <XCircle size={14} className="text-red-600" />;
      default: return <Clock size={14} className="text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic">Stock Out Management</h2>
          <p className="text-xs opacity-50 uppercase tracking-wider">Two-Phase Commitment: Allocation → Execution</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#141414] text-[#E4E3E0] px-4 py-2 text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Stock Out (Allocation)
        </button>
      </div>

      <div className="border border-[#141414] overflow-hidden">
        <div className="grid grid-cols-[120px_1fr_1fr_80px_120px_150px] bg-[#141414] text-[#E4E3E0] p-3 text-[10px] uppercase tracking-widest font-bold">
          <div>Date</div>
          <div>Product</div>
          <div>Customer</div>
          <div className="text-center">Qty</div>
          <div className="text-center">Status</div>
          <div className="text-right">Actions</div>
        </div>
        
        {stockOutTransactions.length === 0 ? (
          <div className="p-12 text-center opacity-30 italic text-sm">
            No stock out transactions recorded.
          </div>
        ) : (
          stockOutTransactions.map((t) => {
            const product = products.find(p => p.sku === t.sku);
            return (
              <div 
                key={t.id}
                className="grid grid-cols-[120px_1fr_1fr_80px_120px_150px] p-4 border-t border-[#141414] text-sm items-center hover:bg-[#141414]/5 transition-colors"
              >
                <div className="text-[10px] font-mono opacity-50">
                  {t.createdAt ? format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm') : 'Pending...'}
                </div>
                <div>
                  <div className="font-medium">{product?.name || 'Unknown Product'}</div>
                  <div className="text-[10px] font-mono opacity-50">{t.sku}</div>
                </div>
                <div className="text-xs opacity-70">{t.customer || '-'}</div>
                <div className="text-center font-mono font-bold text-red-600">-{t.quantity}</div>
                <div className="flex justify-center">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-[#141414]/5 text-[10px] font-bold uppercase tracking-tighter rounded">
                    {getStatusIcon(t.status)}
                    {t.status}
                  </span>
                </div>
                <div className="text-right space-x-2">
                  {t.status === 'DRAFT' && (
                    <>
                      <button 
                        onClick={() => updateStockOutStatus(t.id, 'IN_PROGRESS')}
                        className="text-[10px] uppercase font-bold border border-[#141414] px-2 py-1 hover:bg-[#141414] hover:text-[#E4E3E0]"
                      >
                        Pack
                      </button>
                      <button 
                        onClick={() => updateStockOutStatus(t.id, 'CANCELLED')}
                        className="text-[10px] uppercase font-bold border border-red-600 text-red-600 px-2 py-1 hover:bg-red-600 hover:text-white"
                      >
                        Release
                      </button>
                    </>
                  )}
                  {t.status === 'IN_PROGRESS' && (
                    <>
                      <button 
                        onClick={() => updateStockOutStatus(t.id, 'DONE')}
                        className="text-[10px] uppercase font-bold bg-green-600 text-white px-2 py-1 hover:opacity-90"
                      >
                        Ship
                      </button>
                      <button 
                        onClick={() => updateStockOutStatus(t.id, 'CANCELLED')}
                        className="text-[10px] uppercase font-bold border border-red-600 text-red-600 px-2 py-1 hover:bg-red-600 hover:text-white"
                      >
                        Rollback
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Stock Out Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-md p-8 space-y-6">
            <h3 className="text-xl font-serif italic">New Stock Out (Allocation)</h3>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-900/20 flex gap-3 text-red-900 text-xs">
                <AlertTriangle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              const formData = new FormData(e.currentTarget);
              try {
                await createStockOut(
                  formData.get('sku') as string,
                  Number(formData.get('quantity')),
                  formData.get('customer') as string
                );
                setIsAdding(false);
              } catch (err: any) {
                setError(err.message);
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">Select Product</label>
                <select name="sku" required className="w-full bg-transparent border border-[#141414] p-2 text-sm">
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} (Avail: {p.availableStock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">Customer / Destination</label>
                <input name="customer" className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">Quantity to Allocate</label>
                <input name="quantity" type="number" min="1" required className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 border border-[#141414] py-2 text-sm hover:bg-[#141414]/5">Cancel</button>
                <button type="submit" className="flex-1 bg-[#141414] text-[#E4E3E0] py-2 text-sm hover:opacity-90">Allocate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
