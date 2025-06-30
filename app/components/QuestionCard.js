'use client';

import { useEffect, useState } from 'react';
import { FiFlag, FiMessageCircle, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import AnswerModal from './AnswerModal';

const BADGE_META = {
    'hot': { label: 'Hot', color: 'bg-red-500 text-white', icon: '🔥' },
    'ai-starred': { label: 'AI', color: 'bg-pink-500 text-white', icon: '🤖' },
    'verified-source': { label: 'Doğrulanmış', color: 'bg-blue-500 text-white', icon: '🔗' },
    'trend': { label: 'Trend', color: 'bg-indigo-500 text-white', icon: '📈' },
};

const categoryColors = {
    Felsefe: 'bg-gradient-to-r from-indigo-50 to-slate-50',
    Fizik: 'bg-gradient-to-r from-cyan-50 to-blue-50',
    Din: 'bg-gradient-to-r from-pink-50 to-violet-50',
    Kimya: 'bg-gradient-to-r from-lime-50 to-green-50',
    Sosyoloji: 'bg-gradient-to-r from-rose-50 to-pink-50',
    default: 'bg-white',
};

export default function QuestionCard({ question, onComment }) {
    const {
        id,
        content,
        category,
        created_at,
        answerCount = 0,
        badges = [],
        nickname
    } = question;

    const [expanded, setExpanded] = useState(false);
    const [voteCount, setVoteCount] = useState(0);
    const [myVote, setMyVote] = useState(0);
    const [isVoting, setIsVoting] = useState(false);
    const [showAnswerModal, setShowAnswerModal] = useState(false);

    useEffect(() => {
        fetch(`/api/vote-question?id=${id}`)
            .then(res => res.json())
            .then(data => {
                setVoteCount(data.totalVotes || 0);
                setMyVote(data.myVote || 0);
            })
            .catch(() => { });
    }, [id]);

    const upvote = async () => {
        if (isVoting || myVote === 1) return;
        setIsVoting(true);
        try {
            await fetch('/api/vote-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: id, vote: 1 }),
            });
            const res = await fetch(`/api/vote-question?id=${id}`);
            const data = await res.json();
            setVoteCount(data.totalVotes || 0);
            setMyVote(data.myVote || 0);
        } finally {
            setIsVoting(false);
        }
    };

    const report = () => {
        console.warn('Şikayet fonksiyonu henüz bağlanmadı.');
    };

    return (
        <div
            className={`
                ${categoryColors[category] || categoryColors.default}
                border border-gray-200 dark:border-zinc-800 rounded-xl
                w-full max-w-3xl mx-auto mb-8 shadow-sm hover:shadow-md
                transition-shadow px-8 py-6 flex flex-col gap-4
                hover:bg-blue-50/20 dark:hover:bg-[#1c2130]
            `}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
                        {category}
                    </span>
                    {nickname && (
                        <a
                            href={`/profile/${encodeURIComponent(nickname)}`}
                            className="text-sm font-semibold text-orange-600 hover:underline"
                        >
                            {nickname}
                        </a>
                    )}
                    <span className="text-gray-400 dark:text-gray-500 text-xs">
                        {new Date(created_at).toLocaleDateString('tr-TR')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {badges.map((badge) => (
                        <Link
                            key={badge}
                            href={`/badge/${badge}`}
                            title={BADGE_META[badge]?.label}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${BADGE_META[badge]?.color || ''}`}
                        >
                            <span>{BADGE_META[badge]?.icon}</span>
                            {BADGE_META[badge]?.label}
                        </Link>
                    ))}
                    <button
                        onClick={report}
                        className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800 transition"
                        title="Şikayet Et"
                    >
                        <FiFlag />
                    </button>
                </div>
            </div>

            <div>
                <p className={`text-gray-800 dark:text-gray-100 text-base leading-relaxed tracking-tight font-medium ${expanded ? '' : 'line-clamp-5'}`}>
                    {content}
                </p>
                {content.length > 260 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-blue-600 dark:text-blue-400 underline mt-1"
                    >
                        {expanded ? 'Daha az göster' : 'Daha fazla göster'}
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2 border-t border-gray-200 dark:border-zinc-700 mt-auto">
                <div className="flex items-center gap-4">
                    <button
                        onClick={upvote}
                        disabled={isVoting || myVote === 1}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border border-blue-300 dark:border-blue-800 
                            ${myVote === 1 ? 'ring-2 ring-blue-400 bg-blue-100 dark:bg-blue-800' : 'bg-white dark:bg-[#1b2230]'}
                            text-blue-700 dark:text-blue-200 hover:scale-105 transition`}
                        title="Beğen"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M12 4l6 9H6l6-9z" fill={myVote === 1 ? '#2563eb' : '#38bdf8'} />
                        </svg>
                    </button>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{voteCount}</span>
                    <button
                        onClick={() => onComment?.(id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#232a37] text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-800 transition"
                        title="Yorumlar"
                    >
                        <FiMessageCircle className="text-base" />
                        {answerCount} Yorum
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onComment?.(id)}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 text-white text-sm font-bold shadow hover:scale-[1.03] transition"
                    >
                        Detay <FiChevronRight className="inline ml-1" />
                    </button>
                    <button
                        onClick={() => setShowAnswerModal(true)}
                        className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold border border-blue-200 hover:bg-blue-100 transition"
                    >
                        Cevapla
                    </button>
                </div>
            </div>

            <AnswerModal
                open={showAnswerModal}
                onClose={() => setShowAnswerModal(false)}
                questionId={id}
                onAnswerSent={() => onComment?.(id)}
            />
        </div>
    );
}
