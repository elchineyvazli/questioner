'use client';
import { useState } from 'react';

export default function AnswerModal({ open, onClose, questionId, onAnswerSent }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!open) return null;

    const handleSubmit = async () => {
        if (content.trim().split(/\s+/).length < 5) {
            setError('Lütfen daha anlamlı bir cevap yaz.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/add-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, content }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'ok') {
                onAnswerSent?.(data.answer);
                setContent('');
                onClose();
            } else {
                setError(data.error || 'Gönderim başarısız.');
            }
        } catch {
            setError('Sunucu hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-300">Cevabınızı Yazın</h2>
                <textarea
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                    rows={4}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Cevabınızı buraya yazın..."
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end mt-4 gap-3">
                    <button onClick={onClose} className="text-gray-500 hover:underline">İptal</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !content.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                    >
                        {loading ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                </div>
            </div>
        </div>
    );
}
