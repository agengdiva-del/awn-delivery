import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, MessageCircle, Phone, Sparkles } from 'lucide-react';

interface CustomerChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerChatSupportModal: React.FC<CustomerChatSupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useApp();
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `Halo kak ${user?.name || 'Pelanggan'}! Ada yang bisa kami bantu seputar pesanan, resto UMKM, atau pengiriman kurir di Arjawinangun?`,
      time: 'Baru saja',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: inputVal, time: now };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Pesan Anda telah kami catat. Tim Arjawinangun Delivery siap membantu 24/7. Anda juga dapat langsung chat melalui WhatsApp Official di tombol atas.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-[80vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 bg-pink-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold">Bantuan & Customer Service</h3>
              <span className="text-[10px] text-pink-200">Arjawinangun Delivery Support</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Arjawinangun%20Delivery%2C%20saya%20butuh%20bantuan"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] bg-pink-600 hover:bg-pink-500 text-white font-bold px-2 py-1 rounded transition"
            >
              WhatsApp Langsung
            </a>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-pink-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <span
                  className={`text-[9px] block text-right mt-1 ${
                    m.sender === 'user' ? 'text-pink-200' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-2.5 border-t border-slate-200 bg-white flex items-center space-x-2">
          <input
            type="text"
            placeholder="Tulis pesan Anda..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 text-xs px-3.5 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
          <button
            onClick={handleSend}
            className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
