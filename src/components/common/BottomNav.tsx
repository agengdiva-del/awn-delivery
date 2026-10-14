import React from 'react';
import { Home, Receipt, MessageCircle, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'orders' | 'chat' | 'account';
  onChangeTab: (tab: 'home' | 'orders' | 'chat' | 'account') => void;
  ordersBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  ordersBadgeCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-4 shadow-lg max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {/* Beranda */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center py-1 px-3 transition group ${
            activeTab === 'home' ? 'text-pink-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 transition ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Beranda</span>
        </button>

        {/* Pesanan */}
        <button
          onClick={() => onChangeTab('orders')}
          className={`flex flex-col items-center py-1 px-3 relative transition group ${
            activeTab === 'orders' ? 'text-pink-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className={`w-5 h-5 transition ${activeTab === 'orders' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Pesanan</span>
          {ordersBadgeCount > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-pink-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
              {ordersBadgeCount}
            </span>
          )}
        </button>

        {/* Chat */}
        <button
          onClick={() => onChangeTab('chat')}
          className={`flex flex-col items-center py-1 px-3 transition group ${
            activeTab === 'chat' ? 'text-pink-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageCircle className={`w-5 h-5 transition ${activeTab === 'chat' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Chat</span>
        </button>

        {/* Akun */}
        <button
          onClick={() => onChangeTab('account')}
          className={`flex flex-col items-center py-1 px-3 transition group ${
            activeTab === 'account' ? 'text-pink-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className={`w-5 h-5 transition ${activeTab === 'account' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Akun</span>
        </button>
      </div>
    </nav>
  );
};
