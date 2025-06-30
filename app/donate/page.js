'use client';
import { useEffect, useState } from 'react';
import DonateModal from '../components/DonateModal';
import CryptoDonateModal from '../components/CryptoDonateModal';
import { FaTrophy, FaStar, FaHeart, FaUserFriends } from 'react-icons/fa';
import { FaStripeS } from 'react-icons/fa6';

export default function DonatePage() {
  const [open, setOpen] = useState(false);
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cryptoOpen, setCryptoOpen] = useState(false);

  useEffect(() => {
    fetch('/api/get-weekly-supporters')
      .then(res => res.json())
      .then(data => {
        setSupporters(data.supporters || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const topSupporter = supporters.length
    ? supporters.reduce((max, curr) => (curr.amount > max.amount ? curr : max), supporters[0])
    : null;

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-60px)] flex flex-col justify-center items-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-[#1a202a] dark:to-[#181c24]">
      <div className="w-full flex flex-col items-center justify-center py-6">
        {/* Başlık */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <FaHeart className="text-yellow-400" /> Sorgulayanlar Kulübü <FaHeart className="text-yellow-400" />
          </h1>
          <h2 className="text-lg md:text-xl font-bold text-indigo-700 dark:text-yellow-300 mt-1">DESTEKÇİ PORTALI</h2>
          <p className="mt-2 text-base md:text-lg text-yellow-700 dark:text-yellow-200 font-medium leading-snug max-w-2xl mx-auto">
            Burası reklam ve çıkar çevrelerinden bağımsız, sadece düşünceyle yaşayan bir platform. Destekle, iz bırak; katkın arşivde ve profilinde kalıcı olsun!
          </p>
        </div>

        {/* Kartlar grid */}
        <div className="w-full max-w-[1120px] grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
          {/* Haftanın Destekçisi */}
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded-xl shadow p-5 min-h-[130px] flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-yellow-700 dark:text-yellow-100 flex items-center gap-1">
              <FaTrophy className="inline text-xl" /> Haftanın Destekçisi
            </span>
            {topSupporter ? (
              <div className="mt-2 text-center">
                <span className="font-extrabold text-base text-indigo-700 dark:text-indigo-200">{topSupporter.nickname || "Anonim"}</span>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                  Bağış: <b>${Number(topSupporter.amount || 0).toFixed(2)}</b>
                </div>
                <div className="mt-1 text-xs italic text-gray-400 max-w-xs">{topSupporter.message || ""}</div>
              </div>
            ) : (
              <div className="mt-4 text-gray-400 text-sm">Henüz destek yok</div>
            )}
          </div>
          {/* Rozetler */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-300 dark:border-indigo-700 rounded-xl shadow p-5 min-h-[130px] flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-indigo-700 dark:text-indigo-100 flex items-center gap-1">
              <FaStar className="inline text-lg" /> Destekçi Rozetleri
            </span>
            <ul className="mt-2 text-sm flex flex-col gap-1 text-center">
              <li>🎖️ <b>Fikir Sponsoru</b> — Her bağış</li>
              <li>💎 <b>Kurucu Destekçi</b> — $20 ve üstü</li>
              <li>🏆 <b>Haftanın Destekçisi</b> — Haftalık en yüksek katkı</li>
            </ul>
          </div>
          {/* İstatistikler */}
          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow p-5 min-h-[130px] flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-200 flex items-center gap-1">
              <FaUserFriends className="inline text-lg" /> Destekçi Sayısı
            </span>
            <div className="mt-2 text-3xl font-black text-yellow-500 dark:text-yellow-300">{supporters.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bu hafta destekçi</div>
          </div>
        </div>

        {/* Açıklama & Buton */}
        <div className="max-w-3xl mx-auto text-center text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium mt-1 mb-3">
          <b>Katkıda bulunmak zorunda değilsin.</b> Ama bu platformu özgür tutanlar, entelektüel destekçiler.<br />
          <span className="text-yellow-700 dark:text-yellow-300 font-bold">
            Katkıda bulunmak için butona tıkla — ister 2$, ister 20$, ister istediğin kadar.
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="mt-0.5 px-10 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white text-lg font-bold shadow-lg tracking-wide transition-all duration-200 flex items-center gap-2"
        >
          <FaStripeS className="text-xl text-white" /> DESTEK OL
        </button>
      </div>
      {/* Modal */}
      <button
        onClick={() => setCryptoOpen(true)}
        className="mt-3 px-6 py-3 rounded-full bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700"
      >
        Kripto ile Destekle
      </button>
      {open && <DonateModal open={open} onClose={() => setOpen(false)} />}

      {cryptoOpen && <CryptoDonateModal open={cryptoOpen} onClose={() => setCryptoOpen(false)} />}
    </div>
  );
}
