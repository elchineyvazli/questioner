'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProfileAnswers from '@/app/components/ProfileAnswers';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import BadgeInfoModal from '@/app/components/BadgeInfoModal';

export default function UserProfilePage() {
    const { nick } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('answers');
    const [badgeModalOpen, setBadgeModalOpen] = useState(false);

    useEffect(() => {
        if (!nick) return;
        fetch(`/api/profile-stats?nick=${encodeURIComponent(nick)}`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [nick]);

    if (loading) {
        return <div className="text-center mt-10 text-sm text-gray-500">Yükleniyor...</div>;
    }

    if (!stats) {
        return <div className="text-center mt-10 text-red-600 font-semibold">Kullanıcı bulunamadı.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            {/* Üst Profil Kartı */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
                {/* Kapak */}
                <div className="h-32 bg-gradient-to-r from-orange-400 to-purple-500"></div>

                <div className="p-6 pt-2">
                    <div className="-mt-14 mb-3">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 text-white text-3xl font-extrabold flex items-center justify-center border-4 border-white dark:border-zinc-800 shadow-lg">
                            {nick[0].toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{nick}</h1>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                            Katılım: {stats.joinedAt ? format(new Date(stats.joinedAt), "PPP", { locale: tr }) : '—'}
                        </div>
                    </div>

                    {/* Rozetler */}
                    {stats.badges?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {stats.badges.map(b => (
                                <span
                                    key={b}
                                    className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700 cursor-pointer hover:underline"
                                    onClick={() => setBadgeModalOpen(true)}
                                >
                                    {b}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow border border-gray-200 dark:border-zinc-700">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-300">{stats.totalAnswers}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Toplam Cevap</div>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow border border-gray-200 dark:border-zinc-700">
                    <div className="text-xl font-bold text-green-600 dark:text-green-300">{stats.totalVotes || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Toplam Oy</div>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow border border-gray-200 dark:border-zinc-700">
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-300">{stats.badges?.length || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rozet</div>
                </div>
            </div>

            {/* Sekmeler */}
            <div>
                <div className="flex gap-3 border-b border-gray-200 dark:border-zinc-700 text-sm font-semibold">
                    <button
                        className={`pb-1.5 ${tab === 'answers' ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'}`}
                        onClick={() => setTab('answers')}
                    >
                        🧠 Cevaplar
                    </button>
                </div>
                <div className="mt-4">
                    {tab === 'answers' && <ProfileAnswers nickname={nick} />}
                </div>
            </div>

            <BadgeInfoModal open={badgeModalOpen} onClose={() => setBadgeModalOpen(false)} />
        </div>
    );
}
