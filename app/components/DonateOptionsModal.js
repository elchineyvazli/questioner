'use client';

import { useState } from 'react';
import CryptoDonateModal from './CryptoDonateModal';
import Link from 'next/link';

export default function DonateOptionsModal({ open, onClose }) {
  const [showCrypto, setShowCrypto] = useState(false);

  if (!open) return null;

  return (
    <>
      {!showCrypto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl w-full max-w-md shadow-xl relative">
            <h2 className="text-xl font-bold mb-4 text-center text-yellow-600 dark:text-yellow-300">
              Nasıl destek olmak istersin?
            </h2>

            <div className="flex flex-col gap-4">
              {/* PayPal */}
              <Link
                href="https://www.paypal.com/donate/?hosted_button_id=X4R8E6BT6USGC"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-center hover:bg-blue-700 transition"
              >
                PayPal ile Destekle
              </Link>

              {/* Kripto */}
              <button
                onClick={() => setShowCrypto(true)}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-center hover:bg-green-700 transition"
              >
                Kripto ile Destekle
              </button>

              <div className="text-center text-xs text-gray-400 mt-1">
                Kripto ödemelerde <strong>KDV uygulanmaz</strong>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 font-bold text-lg"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Kripto modal aktifse */}
      {showCrypto && <CryptoDonateModal open={true} onClose={onClose} />}
    </>
  );
}
