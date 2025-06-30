// app/components/Sidebar.js (YENİ HÂLİ)

'use client';
import Link from 'next/link';
import {
    FiStar,
    FiBookOpen,
    FiTrendingUp,
    FiUsers,
    FiGlobe,
    FiChevronRight,
    FiMessageSquare
} from 'react-icons/fi';

const CATEGORIES = [
    { label: 'Felsefe', icon: <FiBookOpen />, slug: 'felsefe' },
    { label: 'Fizik', icon: <FiTrendingUp />, slug: 'fizik' },
    { label: 'Din', icon: <FiStar />, slug: 'din' },
    { label: 'Kimya', icon: <FiBookOpen />, slug: 'kimya' },
    { label: 'Sosyoloji', icon: <FiUsers />, slug: 'sosyoloji' },
];

export default function Sidebar({ currentCategory, onSelectCategory }) {
    return (
        <aside
            className="flex flex-col gap-7 w-60 min-h-[80vh] pt-12 pb-10 px-4
    bg-gradient-to-b from-white via-blue-50/80 to-[#f4f8fa] dark:from-[#1a202a] dark:to-[#181c24]
    border-r border-blue-100 dark:border-[#222436] shadow-2xl rounded-2xl mr-2"
        >
            <div className="mb-3 mt-8">
                <span className="font-extrabold text-xl text-indigo-700 dark:text-indigo-200 flex items-center gap-2 tracking-tight">
                    <FiStar className="text-2xl" /> Keşfet & Kategoriler
                </span>
            </div>
            <div className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/tag/${cat.slug}`}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-base font-semibold
                        border border-transparent
                        ${currentCategory === cat.label
                                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 border-indigo-400 dark:border-indigo-700 shadow'
                                : 'hover:bg-indigo-100 dark:hover:bg-[#23263a] text-gray-700 dark:text-gray-300'
                            }
                        hover:shadow-blue-100 dark:hover:shadow-blue-900 hover:scale-[1.03]`}
                    >
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.label}</span>
                        <FiChevronRight className="ml-auto opacity-40" />
                    </Link>
                ))}
            </div>
            <div className="my-4 p-5 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-50 dark:from-[#233a47] dark:to-[#21373a]
          shadow-md flex flex-col items-start border border-blue-200 dark:border-blue-800">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-bold tracking-wide">
                    Bugünün Sorusu
                </span>
                <span className="font-bold text-base text-blue-900 dark:text-blue-200 mb-1 leading-snug">
                    “Hayatın anlamı nedir?”
                </span>
                <button className="mt-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition">
                    Cevapla
                </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
                <a
                    href="/resources"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-[#23263a]
              text-gray-700 dark:text-gray-300 font-semibold transition"
                >
                    <FiBookOpen /> Kaynaklar
                </a>
                {/* <a
                    href="/donate"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-50 dark:hover:bg-[#25203a]
              text-pink-600 dark:text-pink-300 font-semibold transition"
                >
                    <FiHeart /> Destek Ol
                </a> */}
                {/* İstersen, sadece zarif “Destekçiler” bölümü: */}
                <a
                    href="/supporters"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-[#222213]
              text-yellow-600 dark:text-yellow-200 font-semibold transition"
                >
                    🏅 Destekçiler
                </a>
                <a
                    href="/comments"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222436]
              text-gray-700 dark:text-gray-200 font-semibold transition"
                >
                    <FiMessageSquare /> Yorumlar
                </a>
                <button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222436]
              text-gray-700 dark:text-gray-200 font-semibold transition"
                >
                    <FiGlobe /> Diller
                </button>
            </div>
            <div className="mt-auto pt-8 text-xs text-gray-400 dark:text-gray-600 text-center select-none">
                &copy; {new Date().getFullYear()} Sorgulayanlar Kulübü
            </div>
        </aside>
    );
}
