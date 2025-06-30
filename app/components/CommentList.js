// app/components/CommentList.js
'use client';
import { useEffect, useState } from 'react';
import ProfileHoverCard from './ProfileHoverCard';

export default function CommentList({ answerId, newComment }) {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetch('/api/get-comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answerId }),
        })
            .then(res => res.json())
            .then(data => setComments(data.comments || []));
    }, [answerId]);

    useEffect(() => {
        if (newComment) {
            setComments(prev => [...prev, newComment]);
        }
    }, [newComment]);

    if (!comments.length) return null;

    return (
        <div className="mt-3 space-y-2">
            {comments.map((c) => (
                <div
                    key={c.id}
                    className="flex items-start gap-2 text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1d2732] border border-gray-200 dark:border-gray-700"
                >
                    {/* Avatar */}
                    <ProfileHoverCard nickname={c.nickname}>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-purple-600 text-white text-xs font-bold select-none">
                                {(c.nickname || 'A')[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-orange-600 dark:text-orange-300 text-xs cursor-pointer hover:underline">
                                {c.nickname || 'Anonim'}
                            </span>

                            {/* Rozetler (sadece varsa) */}
                            {Array.isArray(c.badges) && c.badges.includes("ai-starred") && (
                                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-yellow-100 text-yellow-800 font-bold border border-yellow-300">
                                    🤖 AI
                                </span>
                            )}
                            <span className="text-[10px] text-gray-400 ml-1">
                                {new Date(c.created_at).toLocaleTimeString('tr-TR')}
                            </span>
                        </div>
                    </ProfileHoverCard>

                    {/* İçerik */}
                    <div className="flex-1 text-gray-800 dark:text-gray-100">
                        <div className="text-sm leading-snug">{c.content}</div>
                    </div>

                </div>
            ))}
        </div>
    );
}
