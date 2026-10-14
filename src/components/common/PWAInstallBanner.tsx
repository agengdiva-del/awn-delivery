import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const [showInstructions, setShowInstructions] = useState(false);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner && !deferredPrompt && !showInstructions) {
    return null;
  }

  return (
    <>
      <div className="bg-pink-900 text-white px-4 py-2 text-xs flex items-center justify-between z-50 border-b border-pink-800">
        <div className="flex items-center space-x-2 truncate">
          <Smartphone className="w-4 h-4 text-pink-300 shrink-0" />
          <span className="truncate">Install Arjawinangun Delivery di HP Anda (PWA Cepat & Ringan)</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0 ml-2">
          <button
            onClick={handleInstall}
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition"
          >
            <Download className="w-3 h-3" />
            Install
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-pink-300 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-pink-600" />
                Cara Install Arjawinangun Delivery
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs space-y-2.5 text-slate-600">
              <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
                <p className="font-bold text-pink-900 mb-1">Android / Chrome:</p>
                <p>Ketuk menu titik tiga (⋮) di pojok browser, lalu pilih <span className="font-semibold text-pink-800">"Tambahkan ke Layar Utama"</span>.</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <p className="font-bold text-rose-900 mb-1">iPhone / Safari:</p>
                <p>Ketuk tombol Bagikan (Share ⎋) di bawah layar, lalu pilih <span className="font-semibold text-rose-800">"Add to Home Screen"</span>.</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-2 bg-pink-600 text-white font-bold rounded-xl text-xs hover:bg-pink-700 transition"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
