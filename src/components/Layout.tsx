import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  FileText,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'stock-in', label: 'Stock In', icon: ArrowDownCircle },
    { id: 'stock-out', label: 'Stock Out', icon: ArrowUpCircle },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#E4E3E0] text-[#141414] font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#141414] flex flex-col">
        <div className="p-6 border-bottom border-[#141414]">
          <h1 className="text-xl font-bold tracking-tight uppercase italic font-serif">Smart Inventory</h1>
          <p className="text-[10px] opacity-50 uppercase tracking-widest mt-1">Core System v1.0</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
                activeTab === item.id 
                  ? "bg-[#141414] text-[#E4E3E0]" 
                  : "hover:bg-[#141414]/5"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#141414]">
          <div className="flex items-center gap-3 px-4 py-3 text-xs opacity-50 italic">
            <Settings size={14} />
            System Settings
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-[#141414] flex items-center justify-between px-8 bg-[#E4E3E0]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#141414] flex items-center justify-center text-[#E4E3E0] text-xs font-bold">
              FR
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
