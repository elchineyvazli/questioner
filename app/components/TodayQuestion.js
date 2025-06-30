'use client';
import { useState, useEffect } from 'react';
import { FiArrowRight, FiShare2, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function TodayQuestion() {
    const [question, setQuestion] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('/api/today-question')
            .then(res => res.json())
            .then(data => setQuestion(data.question || null));
    }, []);

    const handleShare = async () => {
        const url = `${window.location.origin}#q-${question.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Bugünün Sorusu",
                    text: question.content,
                    url,
                });
            } catch {
                // kullanıcı iptal etmiş olabilir
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!question) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 70 }}
            className="relative w-full max-w-2xl mx-auto mb-8"
        >
            <div
                className="rounded-3xl px-8 py-7 bg-gradient-to-br from-orange-50 via-yellow-50 to-violet-100 dark:from-[#23232f] dark:via-[#191926] dark:to-[#261c3a] shadow-2xl border border-orange-200 dark:border-[#322240] flex flex-col gap-2 relative overflow-hidden"
                id={`q-${question.id}`} // Link çalışsın diye eklendi!
            >
                <div className="absolute -top-6 -left-8 opacity-15 text-[9rem] select-none pointer-events-none">?</div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase text-orange-600 dark:text-orange-300 tracking-widest bg-orange-50 dark:bg-[#2a2128] px-3 py-1 rounded-full shadow-sm">
                        Bugünün Sorusu
                    </span>
                    <FiArrowRight className="text-orange-400 dark:text-orange-200" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-orange-100 leading-snug mb-2 break-words">
                    {question.content}
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between mt-2 gap-2">
                    <div className="text-base text-gray-500 dark:text-gray-300 font-medium flex items-center gap-2">
                        <FiMessageCircle className="text-orange-400 dark:text-orange-200" />
                        <span>Bugün bu soruyu tartış!</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={`#q-${question.id}`}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold shadow hover:scale-105 hover:bg-orange-500 transition"
                        >
                            Cevapla
                        </a>
                        <button
                            className="px-3 py-2 rounded-lg bg-orange-50 dark:bg-[#2a2128] text-orange-500 dark:text-orange-200 font-semibold shadow hover:bg-orange-100 dark:hover:bg-[#392840] transition"
                            title="Soruyu paylaş"
                            onClick={handleShare}
                        >
                            <FiShare2 className="inline-block mr-1" />
                            {copied ? 'Kopyalandı!' : 'Paylaş'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
