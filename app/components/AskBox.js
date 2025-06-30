'use client';

import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { FaLightbulb } from 'react-icons/fa';

const DEFAULT_CATEGORIES = [
    { value: 'Felsefe', label: 'Felsefe' },
    { value: 'Fizik', label: 'Fizik' },
    { value: 'Din', label: 'Din' },
    { value: 'Kimya', label: 'Kimya' },
    { value: 'Sosyoloji', label: 'Sosyoloji' },
];

const MAX_LENGTH = 280;
const MIN_WORDS = 10;

export default function AskBox({ onSubmitSuccess, categories = DEFAULT_CATEGORIES }) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState(categories[0].value);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const wordCount = (text) =>
        text.trim().split(/\s+/).filter((w) => w.length > 1).length;

    const handleSubmit = async () => {
        const trimmed = content.trim();
        const wc = wordCount(trimmed);
        if (wc < MIN_WORDS) return setError(`Lütfen en az ${MIN_WORDS} kelime yaz.`);
        if (trimmed.length > MAX_LENGTH) return setError('Soru çok uzun.');

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/ask-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: trimmed, category }),
            });

            const data = await res.json();
            if (res.ok && data.status === 'ok') {
                onSubmitSuccess?.({
                    id: data.id,
                    content: trimmed,
                    category,
                    created_at: new Date().toISOString(),
                });
                setContent('');
            } else {
                setError(data.error || 'Bir hata oluştu.');
            }
        } catch {
            setError('Sunucu hatası.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full bg-white dark:bg-[#151b22] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-2">
                <FaLightbulb className="text-yellow-400 text-2xl" />
                <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Fikrini, merakını ya da cevapsız bir sorunu paylaş!
                </span>
            </div>

            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={4}
                    maxLength={MAX_LENGTH}
                    placeholder="Örn: Evrende gerçekten boşluk var mı, yoksa görünmeyen bir şeyle mi dolu?"
                    className="w-full text-base bg-slate-50 dark:bg-[#232a37] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-lg p-3 resize-none focus:ring-2 ring-blue-400 outline-none transition"
                />
                <span
                    className={`absolute right-3 bottom-2 text-xs ${content.length > MAX_LENGTH - 30 ? 'text-red-500' : 'text-gray-400'
                        }`}
                >
                    {content.length}/{MAX_LENGTH}
                </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        type="button"
                        aria-label={`Kategori seç: ${cat.label}`}
                        className={`px-4 py-1.5 rounded-full border font-semibold transition text-sm ${category === cat.value
                                ? 'bg-blue-600 text-white border-blue-600 shadow'
                                : 'bg-slate-100 dark:bg-[#1a212b] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-[#222b36]'
                            }`}
                        onClick={() => setCategory(cat.value)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

            <div className="flex items-center justify-end mt-2">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !content.trim() || content.length > MAX_LENGTH}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition text-base disabled:opacity-60"
                >
                    <FiSend className="text-lg" />
                    {loading ? 'Gönderiliyor...' : 'Sorunu Gönder'}
                </button>
            </div>
        </div>
    );
}
