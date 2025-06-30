// app/components/CommentCard.js
'use client';

import Link from 'next/link';
import ProfileHoverCard from './ProfileHoverCard';

export default function CommentCard({ comment }) {
    if (!comment) return null;

    const {
        nickname = "Anonim",
        content = "",
        badges = [],
        created_at,
        answerId,
    } = comment;

    return (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 shadow-sm">
            {/* Avatar & Nick */}
            <ProfileHoverCard nickname={nickname}>
                <Link href={`/profile/${encodeURIComponent(nickname)}`}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-purple-600 text-white text-lg font-bold select-none shadow">
                        {nickname[0]?.toUpperCase() || "A"}
                    </div>
                </Link>
            </ProfileHoverCard>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <Link href={`/profile/${encodeURIComponent(nickname)}`}>
                        <span className="font-semibold text-orange-700 dark:text-orange-200 text-sm hover:underline">{nickname}</span>
                    </Link>
                    {/* Rozetler */}
                    {Array.isArray(badges) && badges.map((b) => (
                        <span
                            key={b}
                            title={b === "ai-starred" ? "AI tarafından öne çıkarıldı" : `Rozet: ${b}`}
                            className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700 font-semibold"
                        >
                            {b === "ai-starred" ? "🤖 AI" : b}
                        </span>

                    ))}
                    <span className="text-xs text-gray-400 ml-2">
                        {created_at
                            ? new Date(created_at).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' })
                            : ""}
                    </span>
                </div>
                {/* İçerik */}
                <div className="text-gray-800 dark:text-gray-100 mt-1 text-[15px] leading-snug whitespace-pre-line break-words">
                    {content}
                </div>
            </div>
        </div>
    );
}
