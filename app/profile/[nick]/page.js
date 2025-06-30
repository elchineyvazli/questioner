'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import ProfileAnswers from '@/app/components/ProfileAnswers';
import ProfileQuestions from '@/app/components/ProfileQuestions';
import ProfileComments from '@/app/components/ProfileComments';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import NicknameModal from '@/app/components/NicknameModal';
import Link from 'next/link';

export default function UserProfilePage() {
    const { data: session } = useSession();
    const { nick } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('answers');
    const [showNickModal, setShowNickModal] = useState(false);

    const isProfileOwner = session?.user?.name === nick;

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
                    {stats.badges?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {stats.badges.map(b => {
                                // Rozet ikon ve açıklama eşleştirme
                                let badgeIcon = null, badgeColor = "", badgeDesc = "";

                                if (b === "haftanin_destekcisi") {
                                    badgeIcon = "💛";
                                    badgeColor = "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700";
                                    badgeDesc = "Bu kullanıcı bu hafta destek verdi. Haftanın Destekçisi!";
                                } else if (b === "uzman") {
                                    badgeIcon = "🎖️";
                                    badgeColor = "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 border-blue-300 dark:border-blue-700";
                                    badgeDesc = "En az 5 yüksek oy alan cevap sahibi.";
                                } else if (b === "destekçi") {
                                    badgeIcon = "🌟";
                                    badgeColor = "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 border-green-300 dark:border-green-700";
                                    badgeDesc = "En az 3 kaynak eklemiş.";
                                } else if (b === "popüler") {
                                    badgeIcon = "🔥";
                                    badgeColor = "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 border-red-300 dark:border-red-700";
                                    badgeDesc = "Toplam 10 oy ve üzeri alan kişi.";
                                } else {
                                    badgeIcon = "🏅";
                                    badgeColor = "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700";
                                    badgeDesc = "Özel rozet";
                                }

                                return (
                                    <Link key={b} href={`/badge/${encodeURIComponent(b.toLowerCase())}`} legacyBehavior>
                                        <span
                                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border hover:underline transition cursor-pointer flex items-center gap-1 ${badgeColor}`}
                                            title={badgeDesc}
                                        >
                                            <span className="text-base">{badgeIcon}</span>
                                            {b.replace("_", " ").toUpperCase()}
                                        </span>
                                    </Link>
                                );
                            })}
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
                    <button
                        className={`pb-1.5 ${tab === 'questions' ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'}`}
                        onClick={() => setTab('questions')}
                    >
                        ❓ Sorular
                    </button>
                    <button
                        className={`pb-1.5 ${tab === 'comments' ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'}`}
                        onClick={() => setTab('comments')}
                    >
                        🗨️ Yorumlar
                    </button>
                    {isProfileOwner && (
                        <button
                            className={`pb-1.5 ${tab === 'settings' ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setTab('settings')}
                        >
                            ⚙️ Ayarlar
                        </button>
                    )}
                </div>

                <div className="mt-4">
                    {tab === 'answers' && <ProfileAnswers nickname={nick} />}
                    {tab === 'questions' && <ProfileQuestions nickname={nick} />}
                    {tab === 'comments' && <ProfileComments nickname={nick} />}
                    {tab === 'settings' && isProfileOwner && (
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow border mt-4 space-y-4">
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Takma Adını Değiştir</div>
                            <button
                                onClick={() => setShowNickModal(true)}
                                className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-purple-500 rounded-lg shadow hover:scale-105 transition"
                            >
                                Takma Adı Değiştir
                            </button>

                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Oturumu Kapat</div>
                            <button
                                onClick={() => signOut()}
                                className="px-3 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <NicknameModal open={showNickModal} onClose={() => setShowNickModal(false)} onSubmit={() => { }} />
        </div>
    );
}
