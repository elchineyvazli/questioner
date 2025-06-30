// app/components/AskQuestionModal.js
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AskQuestionModal({ open, onClose }) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Genel');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const submit = async () => {
        if (!content.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/create-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, category })
            });
            const data = await res.json();
            if (data.status === 'ok') {
                setSuccess(true);
                setContent('');
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 1500);
            } else {
                setError(data.error || 'Hata oluştu');
            }
        } catch {
            setError('Sunucuya ulaşılamadı');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ y: 40, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 40, opacity: 0, scale: 0.98 }}
                    className="bg-white dark:bg-[#181c24] rounded-2xl shadow-2xl max-w-xl w-full p-6"
                >
                    <h2 className="text-xl font-bold mb-4 text-center text-indigo-600 dark:text-indigo-300">
                        Yeni Soru Sor
                    </h2>
                    <textarea
                        rows={5}
                        className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white resize-none focus:ring-2 ring-blue-400"
                        placeholder="Sormak istediğin soruyu buraya yaz..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={loading || success}
                    />
                    <input
                        type="text"
                        className="w-full mt-3 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Kategori (örn. Bilim, Tarih)"
                        disabled={loading || success}
                    />

                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                    {success && <div className="text-green-500 text-sm mt-2">Soru eklendi ✅</div>}

                    <div className="mt-4 flex justify-end gap-3">
                        <button onClick={onClose} className="text-sm text-gray-500 hover:text-red-500">İptal</button>
                        <button
                            onClick={submit}
                            disabled={loading || !content.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Gönderiliyor...' : 'Soruyu Gönder'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
