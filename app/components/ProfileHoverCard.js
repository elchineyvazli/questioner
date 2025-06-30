// app/components/ProfileHoverCard.js
'use client';
import { useEffect, useState } from 'react';

export default function ProfileHoverCard({ nickname, children }) {
    const [stats, setStats] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open && nickname) {
            fetch(`/api/profile-stats?nick=${encodeURIComponent(nickname)}`)
                .then(res => res.json())
                .then(setStats);
        }
    }, [open, nickname]);

    return (
        <span
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="relative"
        >
            {children}
            {open && stats && (
                <div className="absolute z-50 left-0 top-8 min-w-[200px] rounded-xl bg-white dark:bg-[#232329] shadow-2xl border border-black/10 dark:border-white/10 px-4 py-3 text-xs text-gray-800 dark:text-gray-200 flex flex-col gap-2 animate-fadein">
                    <div className="font-bold text-base text-orange-600 dark:text-orange-300">
                        {nickname}
                    </div>

                    <div>
                        <b>{stats.totalAnswers}</b> cevap
                        {stats.aiStarred > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 text-white font-bold animate-bounce shadow inline-flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD600">
                                    <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                {stats.aiStarred} AI-Starred
                            </span>
                        )}
                    </div>

                    {/* 🏅 Rozetler */}
                    {stats.badges?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {stats.badges.includes('uzman') && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-800 font-semibold border border-purple-300">
                                    🎓 Uzman
                                </span>
                            )}
                            {stats.badges.includes('destekçi') && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-800 font-semibold border border-green-300">
                                    🌟 Destekçi
                                </span>
                            )}
                            {stats.badges.includes('popüler') && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-pink-100 text-pink-800 font-semibold border border-pink-300">
                                    🔥 Popüler
                                </span>
                            )}
                        </div>
                    )}

                </div>
            )}
        </span>
    );
}
