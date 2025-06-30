'use client';
import { useState, useEffect } from "react";
import { FiAward, FiLightbulb, FiZap, FiActivity } from "react-icons/fi";

export default function WeeklyChallenge() {
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock veri (API ile çekebilirsin)
    useEffect(() => {
        setTimeout(() => {
            setChallenge({
                title: "Yapay Zeka Gerçekten Bilinçlenebilir mi?",
                description: "Haftanın sorusu: Bilim ve felsefe ekseninde, bir AI'nın bilinç kazanması mümkün müdür? Argümanlarınızı bilimsel, etik veya deneysel örneklerle destekleyin. En iyi yorumlar, haftalık rozet ve arşiv onuru kazanır.",
                deadline: "Pazar 23:59",
                reward: "🏆 AI Mücadele Rozeti + Topluluk Onuru"
            });
            setLoading(false);
        }, 600);
    }, []);

    return (
        <section className="rounded-2xl p-5 shadow bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-[#23263a] dark:via-[#1a1c29] dark:to-[#181a23] border border-indigo-100 dark:border-indigo-800 mb-7">
            <div className="flex items-center gap-2 text-lg font-black text-indigo-700 dark:text-indigo-200 mb-3">
                <FiAward className="text-yellow-500" /> Haftanın Challenge'ı
            </div>
            {loading ? (
                <div className="animate-pulse text-gray-400 dark:text-gray-600 text-sm">Yarışma yükleniyor...</div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="font-bold text-indigo-900 dark:text-indigo-100 text-base">{challenge.title}</div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm mb-2">{challenge.description}</div>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-100 px-3 py-1 rounded-full text-xs font-semibold">
                            <FiActivity /> Son Katılım: {challenge.deadline}
                        </span>
                        <span className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold">
                            <FiZap /> {challenge.reward}
                        </span>
                    </div>
                    <button className="mt-3 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow transition-all duration-200 self-start">
                        Katıl / Cevap Yaz
                    </button>
                </div>
            )}
        </section>
    );
}
