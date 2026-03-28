import React, { useState, useEffect } from 'react';
import { useInventoryStore } from './store/useInventoryStore';
import Layout from './components/Layout';
import Inventory from './components/Inventory';
import StockIn from './components/StockIn';
import StockOut from './components/StockOut';
import Reports from './components/Reports';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [isReady, setIsReady] = useState(false);
  const { fetchData } = useInventoryStore();

  useEffect(() => {
    fetchData().then(() => setIsReady(true));
  }, [fetchData]);

  if (!isReady) {
    return (
      <div className="h-screen bg-[#E4E3E0] flex items-center justify-center font-serif italic text-xl">
        Initializing Smart Inventory System...
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'inventory' && <Inventory />}
      {activeTab === 'stock-in' && <StockIn />}
      {activeTab === 'stock-out' && <StockOut />}
      {activeTab === 'reports' && <Reports />}
    </Layout>
  );
}
