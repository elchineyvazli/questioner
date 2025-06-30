'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function FilterBar({ current, onSelect, categories }) {
    const filters = [
        { label: "Tümü", value: "Tümü" },
        { label: "AI Starred", value: "AI Starred" },
        { label: "Trend", value: "Trend" },
        ...categories.filter(c => !["Tümü", "AI Starred", "Trend"].includes(c)).map(c => ({ label: c, value: c }))
    ];

    return (
        <div className="flex flex-wrap gap-2 py-3 px-2 bg-white/70 dark:bg-[#191f29]/80 rounded-2xl shadow-sm border border-gray-100 dark:border-[#25273a] transition">
            {filters.map(f => {
                const isActive = current === f.value;
                return (
                    <button
                        key={f.value}
                        onClick={() => onSelect(f.value)}
                        className={`
                            relative px-4 py-2 rounded-xl text-base font-bold 
                            transition-all duration-200 outline-none focus:ring-2 ring-orange-400
                            ${isActive
                                ? "bg-gradient-to-r from-[#fa9e1b] to-[#ff4e50] text-white shadow-lg"
                                : "bg-slate-100 dark:bg-[#25273a] text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[#2a2e3e] hover:scale-105 hover:shadow"}
                        `}
                        style={{ minWidth: 90, willChange: "transform" }}
                    >
                        <span>{f.label}</span>
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    layoutId={`filter-active-${f.value}`}
                                    className="absolute inset-0 rounded-xl ring-2 ring-orange-300 pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                />
                            )}
                        </AnimatePresence>
                    </button>
                );
            })}
        </div>
    );
}
