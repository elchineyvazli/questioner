'use client';

import { useState, useEffect } from 'react';
import NicknameModal from './NicknameModal';

export default function AnswerBox({ questionId, onSubmitSuccess }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);
    const [nickname, setNickname] = useState('');
    const [askNick, setAskNick] = useState(false);
    const [source, setSource] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const nick = localStorage.getItem('nickname');
            if (nick) setNickname(nick);
        }
    }, []);

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError('Cevap boş olamaz.');
            return;
        }
        if (!nickname) {
            setAskNick(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/submit-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, content, nickname, source }),
            });

            const data = await res.json();

            if (res.status === 200 && data.status === 'ok') {
                setSent(true);
                setContent('');
                onSubmitSuccess?.({
                    id: data.id,
                    question_id: questionId,
                    content,
                    nickname,
                    created_at: new Date().toISOString(),
                });
            } else {
                setError(data.error || 'Cevap gönderilemedi.');
            }
        } catch (e) {
            setError('Sunucu hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NicknameModal
                open={askNick}
                onSubmit={(nick) => {
                    setNickname(nick);
                    localStorage.setItem('nickname', nick);
                    setAskNick(false);
                    setTimeout(handleSubmit, 50);
                }}
            />

            <div className="mt-3">
                {!nickname && (
                    <div className="text-xs text-orange-500 mb-2">
                        Cevap eklemek için önce takma ad seçmelisin.
                    </div>
                )}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bu soruya cevabınız nedir?"
                    className="w-full text-sm bg-transparent border border-black/10 dark:border-white/10 rounded p-2 outline-none resize-none"
                    rows={3}
                    disabled={sent}
                />
                <input
                    type="text"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="Kaynak (isteğe bağlı, URL veya kitap)"
                    className="w-full mt-2 text-xs bg-transparent border border-black/10 dark:border-white/10 rounded p-2 outline-none"
                    disabled={sent}
                />
                <div className="mt-2 flex justify-between items-center">
                    <button
                        onClick={handleSubmit}
                        disabled={sent || loading}
                        className="px-4 py-1 rounded text-sm bg-foreground text-background disabled:opacity-50"
                    >
                        {sent ? 'Gönderildi' : loading ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                    {error && <span className="text-xs text-red-500">{error}</span>}
                </div>
            </div>
        </>
    );
}
