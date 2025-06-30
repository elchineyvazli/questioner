'use client';

import { useEffect, useState } from "react";
import { FiTrendingUp, FiUsers, FiMessageCircle } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";

// Fake trends örnek (API ile dinamik yapılabilir)
const FAKE_TRENDS = [
    {
        id: "ai-bilincligi",
        title: "Yapay Zekâ Bilinci",
        description: "Makinalar gerçekten düşünebilir mi? Sınır nedir?",
        messages: 184,
        users: 42,
        updated: "3 dakika önce"
    },
    {
        id: "paralel-evrenler",
        title: "Paralel Evrenler",
        description: "Birden çok gerçeklik mi var? Bilim ne diyor?",
        messages: 107,
        users: 21,
        updated: "az önce"
    },
    {
        id: "zihin-felsefesi",
        title: "Zihin Felsefesi",
        description: "Bilinç ve kimlik sorunsalı, zihin-bedensel tartışmalar.",
        messages: 89,
        users: 15,
        updated: "7 dakika önce"
    },
];

export default function DiscussionTrends() {
    // Sonra API'den çekilecek:
    const [trends, setTrends] = useState(FAKE_TRENDS);

    // Eğer API'den çekilecekse:
    // useEffect(() => { fetch("/api/discussion-trends").then(r => r.json()).then(setTrends); }, []);

    return (
        <section className="mb-7">
            <div className="flex items-center gap-2 mb-4">
                <FiTrendingUp className="text-2xl text-indigo-700 dark:text-yellow-300" />
                <span className="text-lg font-bold text-indigo-800 dark:text-indigo-200 tracking-tight">
                    Gündem & Trend Tartışmalar
                </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {trends.map(trend => (
                    <motion.div
                        key={trend.id}
                        className="rounded-2xl bg-white/95 dark:bg-[#181c29]/80 border border-indigo-100 dark:border-indigo-900 shadow hover:shadow-lg transition cursor-pointer flex flex-col p-4 relative overflow-hidden"
                        whileHover={{ scale: 1.025, boxShadow: "0 4px 32px 0 rgba(160,120,255,0.16)" }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-indigo-700 dark:text-indigo-200">
                                {trend.title}
                            </span>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200 text-xs font-bold">
                                {trend.users} aktif
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{trend.description}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <FiUsers /> {trend.users} üye
                            <FiMessageCircle /> {trend.messages} mesaj
                            <span className="ml-auto">{trend.updated}</span>
                        </div>
                        <Link
                            href={`/discussions/${trend.id}`}
                            className="absolute right-4 bottom-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow transition"
                        >
                            Sohbete Katıl
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
