import { create } from 'zustand';

export interface Product {
  sku: string;
  name: string;
  description: string;
  customer: string;
  physicalStock: number;
  availableStock: number;
}

export interface Transaction {
  id: string;
  sku: string;
  quantity: number;
  customer: string;
  status: 'CREATED' | 'DRAFT' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  type: 'IN' | 'OUT';
  createdAt: string;
}

interface InventoryState {
  products: Product[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  
  fetchData: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  adjustStock: (sku: string, newPhysical: number) => Promise<void>;
  
  // Stock In
  createStockIn: (sku: string, quantity: number, customer: string) => Promise<void>;
  updateStockInStatus: (id: string, status: Transaction['status']) => Promise<void>;
  
  // Stock Out (Two-Phase Commitment)
  createStockOut: (sku: string, quantity: number, customer: string) => Promise<void>;
  updateStockOutStatus: (id: string, status: Transaction['status']) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  transactions: [],
  loading: true,
  error: null,

  fetchData: async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/transactions')
      ]);
      const products = await pRes.json();
      const transactions = await tRes.json();
      set({ products, transactions, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch data", loading: false });
    }
  },

  addProduct: async (product) => {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    get().fetchData();
  },

  adjustStock: async (sku, newPhysical) => {
    await fetch(`/api/products/${sku}/adjust`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPhysical })
    });
    get().fetchData();
  },

  createStockIn: async (sku, quantity, customer) => {
    await fetch('/api/stock-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, quantity, customer })
    });
    get().fetchData();
  },

  updateStockInStatus: async (id, status) => {
    await fetch(`/api/stock-in/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    get().fetchData();
  },

  createStockOut: async (sku, quantity, customer) => {
    const res = await fetch('/api/stock-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, quantity, customer })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create stock out");
    }
    get().fetchData();
  },

  updateStockOutStatus: async (id, status) => {
    await fetch(`/api/stock-out/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    get().fetchData();
  }
}));
