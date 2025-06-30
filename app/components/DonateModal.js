'use client';
import { useState, useEffect } from 'react';
import { FaPaypal, FaCoins, FaInfoCircle } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

export default function DonateModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [cryptoOpen, setCryptoOpen] = useState(false);

  useEffect(() => {
    const openHandler = () => setCryptoOpen(true);
    window.addEventListener('openCryptoModal', openHandler);
    return () => window.removeEventListener('openCryptoModal', openHandler);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full px-7 py-8 border-2 border-yellow-300 dark:border-yellow-700 animate-fade-in">

        {/* Kapat */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-xl font-bold"
          aria-label="Kapat"
        >
          <MdClose />
        </button>

        {/* Başlık */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-yellow-500 dark:text-yellow-300 mb-1">Destek Ol</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Platformu özgür ve bağımsız tutmamıza yardımcı olmak ister misin?
          </p>
        </div>

        {/* Seçenekler */}
        <div className="flex flex-col gap-4">

          {/* PayPal */}
          <button
            className="w-full bg-white dark:bg-zinc-800 border-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-700 text-blue-600 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-200"
            onClick={() => alert("PayPal entegrasyonu henüz aktif değil.")}
            disabled={loading}
          >
            <FaPaypal className="text-2xl" /> PayPal ile Öde
          </button>

          {/* Kripto */}
          <button
            className="w-full bg-white dark:bg-zinc-800 border-2 border-yellow-500 hover:bg-yellow-50 dark:hover:bg-zinc-700 text-yellow-700 dark:text-yellow-200 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-200"
            onClick={() => {
              onClose(); // bu modalı kapat
              const event = new CustomEvent('openCryptoModal');
              window.dispatchEvent(event); // kripto modalı tetikle
            }}
            disabled={loading}
          >
            <FaCoins className="text-2xl" /> Kripto ile Destekle
          </button>

          {/* KDV bilgisi */}
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <FaInfoCircle className="text-sm" /> KDV uygulanmaz
          </div>
        </div>
      </div>
    </div>
  );
}
