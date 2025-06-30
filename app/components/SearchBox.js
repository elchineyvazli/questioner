'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from "react-icons/fi";

export default function SearchBox({ onSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Dışarı tıklama ile kapanma
    useEffect(() => {
        if (!show) return;
        const handler = (e) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setShow(false);
            }
        };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, [show]);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const controller = new AbortController();
        fetch(`/api/search-questions?q=${encodeURIComponent(query)}`, { signal: controller.signal })
            .then(res => res.json())
            .then(data => setResults(data.questions || []))
            .catch(err => {
                if (err.name !== "AbortError") {
                    console.error(err);
                }
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, [query]);

    function handleKeyDown(e) {
        if (e.key === "Enter" && results.length > 0) {
            setShow(false);
            setQuery('');
            onSelect?.(results[0]);
        }
    }

    function highlight(text, query) {
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeQuery})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <mark key={i} className="bg-yellow-300 px-0.5 rounded">{part}</mark>
                : part
        );
    }

    return (
        <div className="relative w-full max-w-lg mx-auto">
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 dark:text-gray-300 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onFocus={() => setShow(true)}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Sorularda ara…"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 text-base bg-white dark:bg-[#181c24] text-gray-800 dark:text-white focus:ring-2 ring-orange-300 shadow-lg focus:outline-none transition"
                    spellCheck={false}
                />
            </div>
            <AnimatePresence>
                {show && query && (
                    <motion.ul
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute w-full mt-3 z-30 bg-white dark:bg-[#181c24] shadow-2xl rounded-2xl border border-orange-100 dark:border-zinc-800 max-h-80 overflow-auto"
                    >
                        {loading ? (
                            <li className="py-4 px-5 text-base text-orange-400">Aranıyor…</li>
                        ) : results.length === 0 ? (
                            <li className="py-4 px-5 text-base text-gray-400">Eşleşen soru bulunamadı.</li>
                        ) : results.map(q => (
                            <li
                                key={q.id}
                                className="py-4 px-5 text-base cursor-pointer hover:bg-orange-50 dark:hover:bg-[#25273a] transition font-medium border-b border-gray-50 dark:border-zinc-800 last:border-b-0"
                                onClick={() => {
                                    setShow(false);
                                    setQuery('');
                                    onSelect?.(q);
                                }}
                            >
                                <span className="font-bold text-indigo-600 dark:text-orange-200">{q.category}:</span>
                                {highlight(q.content.slice(0, 80), query)}
                                {q.content.length > 80 ? '…' : ''}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
