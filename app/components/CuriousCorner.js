'use client';

import { useState } from "react";
import { FiZap, FiAperture, FiCpu, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";

const ITEMS = [
    {
        key: "paradoks",
        icon: <FiAperture className="text-yellow-500" />,
        title: "Epimenides Paradoksu",
        desc: "“Bu cümle yanlıştır.” Peki doğruysa, neden yanlış?",
        link: "/paradox/epimenides",
        cta: "Paradoksu Tartış"
    },
    {
        key: "ai-vs-human",
        icon: <FiCpu className="text-blue-500" />,
        title: "AI mı İnsan mı?",
        desc: "Bu cümleyi yapay zekâ mı yazdı, insan mı? Tıkla ve test et!",
        link: "/ai-vs-human",
        cta: "Teste Katıl"
    },
    {
        key: "schrodinger",
        icon: <FiZap className="text-pink-500" />,
        title: "Schrödinger'in Kedisi",
        desc: "Aynı anda hem ölü, hem canlı. Kuantumun deliliği nedir?",
        link: "/science/schrodinger",
        cta: "Kuantumu Keşfet"
    }
];

export default function CuriousCorner() {
    const [hovered, setHovered] = useState(null);

    return (
        <section className="mb-9">
            <div className="flex items-center gap-2 mb-4">
                <FiZap className="text-2xl text-pink-600 dark:text-yellow-200" />
                <span className="text-lg font-bold text-pink-700 dark:text-yellow-100 tracking-tight">
                    Merak Köşesi
                </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {ITEMS.map(item => (
                    <motion.div
                        key={item.key}
                        onMouseEnter={() => setHovered(item.key)}
                        onMouseLeave={() => setHovered(null)}
                        className={`rounded-2xl p-5 bg-gradient-to-br from-white to-pink-50 dark:from-[#23243a] dark:to-[#2e2039] border border-pink-100 dark:border-pink-800 shadow group relative flex flex-col gap-2 transition cursor-pointer`}
                        whileHover={{ scale: 1.03, boxShadow: "0 6px 32px 0 rgba(240,70,150,0.13)" }}
                    >
                        <div className="flex items-center gap-2 text-xl font-bold">
                            {item.icon}
                            <span className="text-pink-700 dark:text-pink-200">{item.title}</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 mb-4">{item.desc}</div>
                        <Link
                            href={item.link}
                            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow transition"
                        >
                            {item.cta} <FiChevronRight />
                        </Link>
                        {hovered === item.key && (
                            <motion.div
                                layoutId="corner-highlight"
                                className="absolute inset-0 rounded-2xl ring-2 ring-pink-400/20 pointer-events-none"
                                transition={{ type: "spring", stiffness: 160, damping: 22 }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
