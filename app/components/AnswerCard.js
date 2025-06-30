'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommentBox from './CommentBox';
import CommentList from './CommentList';
import ProfileHoverCard from './ProfileHoverCard';
import { FiThumbsUp, FiStar } from 'react-icons/fi';

export default function AnswerCard({ answer }) {
    const { id, content, created_at, nickname, badges = [], source, tags = [] } = answer;
    const [votes, setVotes] = useState(0);
    const [voted, setVoted] = useState(false);
    const [newComment, setNewComment] = useState(null);

    useEffect(() => {
        fetch(`/api/vote-answer?id=${id}`)
            .then(res => res.json())
            .then(data => {
                setVotes(data.votes || 0);
                setVoted(data.alreadyVoted || false);
            });
    }, [id]);

    const handleVote = async () => {
        if (voted) return;
        const res = await fetch('/api/vote-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answerId: id }),
        });
        if (res.ok) {
            setVotes(v => v + 1);
            setVoted(true);
        }
    };

    return (
        <div className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181c24] rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex justify-between items-start gap-4">
                {/* Left: Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <ProfileHoverCard nickname={nickname}>
                            <Link
                                href={`/profile/${encodeURIComponent(nickname)}`}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-semibold text-sm group-hover:ring-2 group-hover:ring-indigo-400 transition">
                                    {(nickname || "A")[0].toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-800 dark:text-gray-100 group-hover:underline text-sm">
                                    {nickname || "Anonim"}
                                </span>
                            </Link>
                        </ProfileHoverCard>

                        <span className="text-xs text-gray-400">{new Date(created_at).toLocaleString()}</span>

                        {/* Rozetler */}
                        {badges.includes("ai-starred") && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-yellow-100 text-yellow-800 font-semibold border border-yellow-300 flex items-center gap-1">
                                <FiStar className="text-yellow-500 text-[12px]" />
                                AI
                            </span>
                        )}
                        {votes >= 3 && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">
                                🔥 Yükselen
                            </span>
                        )}
                    </div>

                    <div className="text-gray-900 dark:text-gray-100 leading-relaxed text-sm whitespace-pre-wrap">
                        {content}
                    </div>

                    {/* Etiketler */}
                    {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {tags.map(tag => (
                                <Link key={tag} href={`/tag/${tag}`} className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-zinc-700 transition">
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Kaynak */}
                    {source && (
                        <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 bg-slate-100 dark:bg-[#232a37] px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold mr-1">Kaynak:</span>
                            {/^https?:\/\//.test(source) ? (
                                <a
                                    href={source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline break-all"
                                >
                                    {source}
                                </a>
                            ) : (
                                <span className="italic">{source}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Oy */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleVote}
                        disabled={voted}
                        className={`rounded-full p-2 border ${voted ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"} transition`}
                        title={voted ? "Beğendin" : "Beğen"}
                    >
                        <FiThumbsUp className="text-base" />
                    </button>
                    <span className="text-xs text-gray-500 mt-1">{votes} beğeni</span>
                </div>
            </div>

            {/* Yorumlar */}
            <div className="mt-4">
                <CommentBox answerId={id} onSubmitSuccess={setNewComment} />
                <CommentList answerId={id} newComment={newComment} />
            </div>
        </div>
    );
}
