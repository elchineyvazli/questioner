'use client';
import { useEffect, useState } from "react";
import { FiZap, FiUser, FiClock, FiMessageCircle } from "react-icons/fi";

const MOCK_DISCUSSIONS = [
    {
        id: 1,
        title: "Kuantum fiziğiyle gerçeklik kavramı yeniden mi yazılıyor?",
        users: ["Ada", "Berk", "Cem"],
        lastMessage: "Yapay zeka burada sınır mı koyar?",
        time: "2dk önce"
    },
    {
        id: 2,
        title: "Zihin mi? Beyin mi? Bilinç nerede başlar?",
        users: ["Deniz", "Ece"],
        lastMessage: "Paralel evrenler felsefi olarak mümkün mü?",
        time: "6dk önce"
    },
    {
        id: 3,
        title: "Bilgisayarlar etik karar verebilir mi?",
        users: ["Fatih", "Gizem", "Hilal", "İrem"],
        lastMessage: "Otonom silahlar toplum için tehdit mi?",
        time: "10dk önce"
    },
];

export default function LiveDiscussions() {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Simülasyon/mock: gerçek API/Websocket ile değiştir!
    useEffect(() => {
        setTimeout(() => {
            setDiscussions(MOCK_DISCUSSIONS);
            setLoading(false);
        }, 700);
    }, []);

    return (
        <section className="rounded-2xl p-5 shadow bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-[#202237] dark:via-[#1a1c29] dark:to-[#181a23] border border-indigo-100 dark:border-indigo-800 mb-7">
            <div className="flex items-center gap-2 text-lg font-black text-indigo-700 dark:text-indigo-200 mb-3">
                <FiZap className="text-yellow-500 animate-pulse" /> Canlı Tartışmalar
            </div>
            {loading ? (
                <div className="animate-pulse text-gray-400 dark:text-gray-600 text-sm">Tartışmalar yükleniyor...</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {discussions.map(disc => (
                        <div
                            key={disc.id}
                            className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-zinc-900 rounded-xl shadow border border-indigo-50 dark:border-indigo-900 group transition hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500 cursor-pointer"
                        >
                            <div className="flex-1">
                                <div className="font-bold text-indigo-900 dark:text-indigo-100 group-hover:underline">{disc.title}</div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <FiUser /> {disc.users.join(', ')}
                                    <FiMessageCircle className="ml-4" /> {disc.lastMessage}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="bg-indigo-100 dark:bg-indigo-800 px-2 py-0.5 rounded text-xs font-semibold text-indigo-700 dark:text-indigo-200">
                                    <FiClock className="inline mr-1" /> {disc.time}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 text-center">* Gerçek zamanlı aktif tartışmalar burada akar.</div>
                </div>
            )}
        </section>
    );
}
