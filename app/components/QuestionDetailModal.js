'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFlag, FiChevronDown, FiUser } from 'react-icons/fi';

export default function QuestionDetailModal({ questionId, open, onClose }) {
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || !questionId) return;
        setLoading(true);
        setError(null);
        fetch(`/api/question-detail?id=${questionId}`)
            .then((res) => res.json())
            .then((data) => {
                setQuestion(data.question);
                setAnswers(data.answers || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Veri yüklenemedi.');
                setLoading(false);
            });
    }, [open, questionId]);

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
                    className="bg-white dark:bg-[#181c24] rounded-2xl shadow-2xl max-w-2xl w-full relative flex flex-col overflow-hidden"
                    style={{ maxHeight: '92vh' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-100 to-blue-50 dark:from-[#232a37] dark:to-[#1b2327]">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                                {question?.category || 'Kategori'}
                            </span>
                            <h2 className="font-extrabold text-xl text-gray-900 dark:text-white mt-1">
                                {question?.content || (loading ? 'Yükleniyor...' : 'Soru bulunamadı')}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 hover:bg-red-200 dark:bg-[#3b1e23] dark:hover:bg-[#5e2731] text-red-800 dark:text-red-200 text-xs font-bold transition"
                                title="Şikayet Et"
                                onClick={() => alert('Bildirildi')}
                            >
                                <FiFlag className="text-base" /> Bildir
                            </button>
                            <button
                                onClick={onClose}
                                className="ml-2 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
                                title="Kapat"
                            >
                                <FiX size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="px-6 pt-3 pb-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
                        <span>
                            Eklenme: {question?.created_at ? new Date(question.created_at).toLocaleString() : '--'}
                        </span>
                        <span>
                            Oy: <span className="font-bold text-blue-600">{question?.votes ?? 0}</span>
                        </span>
                        <span>
                            Cevap: <span className="font-bold text-orange-600">{answers.length}</span>
                        </span>
                    </div>

                    {/* İçerik */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        {/* Cevaplar */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <FiChevronDown className="text-xl text-gray-400" />
                                <span className="font-bold text-base text-gray-800 dark:text-gray-200">Cevaplar</span>
                            </div>

                            {loading ? (
                                <div className="py-8 text-center text-gray-400">Yükleniyor...</div>
                            ) : answers.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">Henüz cevap yok. İlk cevabı sen ekle!</div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {answers.map((ans) => (
                                        <div
                                            key={ans.id}
                                            className="rounded-lg bg-slate-100 dark:bg-[#222f37] p-4 border border-gray-100 dark:border-gray-800"
                                        >
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <FiUser className="text-base" />
                                                <span className="font-semibold">{ans.user || 'Anonim'}</span>
                                                <span className="ml-2">{new Date(ans.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="text-sm mt-1 text-gray-800 dark:text-gray-100">{ans.content}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Yeni cevap */}
                        <section>
                            <NewAnswerBox
                                questionId={questionId}
                                onSuccess={(ans) => {
                                    setAnswers((a) => [ans, ...a]);
                                    setQuestion((q) => ({ ...q, answerCount: (q?.answerCount || 0) + 1 }));
                                }}
                            />
                        </section>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Alt bileşen: Yeni cevap kutusu
function NewAnswerBox({ questionId, onSuccess }) {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const submit = async () => {
        if (!value.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/add-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, content: value }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Bir hata oluştu.');

                if (data.error?.includes("sık cevap")) {
                    setError("Bu soruya 4 saat içinde yalnızca 1 cevap yazabilirsin.");
                }
            } else if (data.status === 'ok') {
                onSuccess?.(data.answer);
                setValue('');
            } else {
                setError(data.error || 'Bir hata oluştu.');
            }

        } catch {
            setError('Sunucu hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <textarea
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#232a37] text-sm text-gray-900 dark:text-white resize-none min-h-[56px] focus:ring-2 ring-blue-400"
                placeholder="Cevabını buraya yaz..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
            />
            <div className="flex justify-between items-center">
                {error && <span className="text-xs text-red-500">{error}</span>}
                <button
                    onClick={submit}
                    disabled={loading || !value.trim()}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold shadow hover:scale-105 transition disabled:opacity-50"
                >
                    {loading ? 'Gönderiliyor...' : 'Cevabı Gönder'}
                </button>
            </div>
        </div>
    );
}
