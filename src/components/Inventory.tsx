import React, { useState } from 'react';
import { useInventoryStore, Product } from '../store/useInventoryStore';
import { Search, Plus, Edit2, AlertCircle } from 'lucide-react';

export default function Inventory() {
  const { products, addProduct, adjustStock } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.customer && p.customer.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic">Inventory Overview</h2>
          <p className="text-xs opacity-50 uppercase tracking-wider">Physical vs Available Stock Tracking</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#141414] text-[#E4E3E0] px-4 py-2 text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Register New Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
        <input 
          type="text" 
          placeholder="Filter by SKU, Name, or Customer..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border border-[#141414] py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]"
        />
      </div>

      <div className="border border-[#141414] overflow-hidden">
        <div className="grid grid-cols-[80px_1.5fr_1fr_1fr_1fr_100px] bg-[#141414] text-[#E4E3E0] p-3 text-[10px] uppercase tracking-widest font-bold">
          <div>SKU</div>
          <div>Product Name</div>
          <div>Customer</div>
          <div className="text-center">Physical Stock</div>
          <div className="text-center">Available Stock</div>
          <div className="text-right">Actions</div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center opacity-30 italic text-sm">
            No products found in inventory.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div 
              key={product.sku}
              className="grid grid-cols-[80px_1.5fr_1fr_1fr_1fr_100px] p-4 border-t border-[#141414] text-sm items-center hover:bg-[#141414]/5 transition-colors"
            >
              <div className="font-mono text-xs">{product.sku}</div>
              <div className="font-medium">{product.name}</div>
              <div className="text-xs opacity-70">{product.customer || '-'}</div>
              <div className="text-center font-mono">{product.physicalStock}</div>
              <div className="text-center font-mono">
                <span className={product.availableStock < 10 ? "text-red-600 font-bold" : ""}>
                  {product.availableStock}
                </span>
              </div>
              <div className="text-right">
                <button 
                  onClick={() => setIsAdjusting(product)}
                  className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-md p-8 space-y-6">
            <h3 className="text-xl font-serif italic">Register New Product</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await addProduct({
                sku: formData.get('sku') as string,
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                customer: formData.get('customer') as string,
                physicalStock: Number(formData.get('stock')),
                availableStock: Number(formData.get('stock')),
              });
              setIsAdding(false);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">SKU</label>
                <input name="sku" required className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">Name</label>
                <input name="name" required className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">Customer / Owner</label>
                <input name="customer" className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">Initial Physical Stock</label>
                <input name="stock" type="number" required className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 border border-[#141414] py-2 text-sm hover:bg-[#141414]/5">Cancel</button>
                <button type="submit" className="flex-1 bg-[#141414] text-[#E4E3E0] py-2 text-sm hover:opacity-90">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjusting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-md p-8 space-y-6">
            <h3 className="text-xl font-serif italic">Stock Adjustment</h3>
            <div className="p-3 bg-amber-100 border border-amber-900/20 flex gap-3 text-amber-900 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <p>Manual adjustment will update both Physical and Available stock relative to the change.</p>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await adjustStock(isAdjusting.sku, Number(formData.get('stock')));
              setIsAdjusting(null);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">Product</label>
                <div className="text-sm font-medium">{isAdjusting.name} ({isAdjusting.sku})</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">Current Physical Stock</label>
                <div className="text-sm font-mono">{isAdjusting.physicalStock}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold opacity-50">New Physical Stock</label>
                <input name="stock" type="number" defaultValue={isAdjusting.physicalStock} required className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdjusting(null)} className="flex-1 border border-[#141414] py-2 text-sm hover:bg-[#141414]/5">Cancel</button>
                <button type="submit" className="flex-1 bg-[#141414] text-[#E4E3E0] py-2 text-sm hover:opacity-90">Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
