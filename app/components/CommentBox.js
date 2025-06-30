'use client';

import { useState, useEffect } from 'react';
import NicknameModal from './NicknameModal';

export default function CommentBox({ answerId, onSubmitSuccess }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);
    const [nickname, setNickname] = useState('');
    const [askNick, setAskNick] = useState(false);
    const [lastCommentTime, setLastCommentTime] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const nick = localStorage.getItem('nickname');
            if (nick) setNickname(nick);
            const lastTime = localStorage.getItem('lastCommentTime');
            if (lastTime) setLastCommentTime(parseInt(lastTime));
        }
    }, []);

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError('Yorum boş olamaz.');
            return;
        }
        if (!nickname) {
            setAskNick(true);
            return;
        }

        const now = Date.now();
        if (lastCommentTime && now - lastCommentTime < 30000) {
            setError('Lütfen 30 saniyede bir yorum yapınız.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/submit-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answerId, content, nickname }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'ok') {
                setSent(true);
                setContent('');
                onSubmitSuccess?.(data.comment);
                localStorage.setItem('lastCommentTime', now.toString());
                setLastCommentTime(now);
            } else {
                setError(data.error || 'Gönderilemedi.');
            }
        } catch {
            setError('Sunucu hatası.');
        } finally {
            setLoading(false);
            setTimeout(() => setSent(false), 1200);
        }
    };

    return (
        <>
            <NicknameModal
                open={askNick}
                onSubmit={nick => {
                    setNickname(nick);
                    localStorage.setItem('nickname', nick);
                    setAskNick(false);
                    setTimeout(handleSubmit, 50);
                }}
            />
            <div className="mt-3 border rounded-lg bg-white dark:bg-[#232a37] border-gray-200 dark:border-gray-700 p-3">
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Cevap üzerine düşünceni paylaş..."
                    rows={3}
                    className="w-full text-sm text-gray-800 dark:text-gray-100 bg-transparent outline-none resize-none"
                    disabled={loading || sent}
                />
                <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-red-500">{error}</div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || sent}
                        className="px-4 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {sent ? 'Gönderildi!' : loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                    </button>
                </div>
            </div>
        </>
    );
}
