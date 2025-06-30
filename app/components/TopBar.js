'use client';
import { useState } from "react";
import { FiSearch, FiSun, FiMoon, FiUser, FiHeart } from "react-icons/fi";

export default function Topbar() {
    const [dark, setDark] = useState(
        typeof window !== "undefined"
            ? document.documentElement.classList.contains("dark")
            : false
    );
    const [search, setSearch] = useState("");

    // Tema değiştirici (isteğe bağlı)
    const toggleDark = () => {
        if (typeof window !== "undefined") {
            document.documentElement.classList.toggle("dark");
            setDark(d => !d);
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full z-30 bg-white/80 dark:bg-[#161921]/90 backdrop-blur border-b border-gray-100 dark:border-[#23263a] shadow-sm transition-all">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
                {/* LOGO & Brand */}
                <a href="/" className="flex items-center gap-2 hover:opacity-90 transition">
                    <span className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-400 p-2 shadow">
                        <span className="text-white font-bold text-lg">Q</span>
                    </span>
                    <span className="font-extrabold text-xl text-[#fa9e1b] tracking-tight drop-shadow">Questioner</span>
                </a>

                {/* Orta: Search */}
                <div className="hidden md:flex flex-1 justify-center px-10">
                    <div className="relative w-80">
                        <input
                            type="text"
                            className="w-full py-2 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-[#23263a] text-gray-800 dark:text-white focus:ring-2 ring-indigo-400 outline-none shadow-inner transition"
                            placeholder="Bir soru, konu veya kullanıcı ara..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 text-lg" />
                    </div>
                </div>
                {/* Sağ: Kullanıcı, destek, tema */}
                <div className="flex items-center gap-2">
                    <a
                        href="/destek"
                        className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-400 to-orange-300 text-white font-semibold shadow hover:scale-105 transition"
                        title="Destek Ol"
                    >
                        <FiHeart className="text-lg" />
                        <span>Destek Ol</span>
                    </a>

                    <button
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-[#222436] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#25264a] transition"
                        title="Giriş Yap / Profil"
                    >
                        <FiUser className="text-lg" />
                        <span className="hidden sm:inline">Giriş Yap</span>
                    </button>
                    <button
                        className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-[#222436] hover:bg-gray-200 dark:hover:bg-[#25264a] text-indigo-500 dark:text-indigo-300 transition"
                        title="Tema değiştir"
                        onClick={toggleDark}
                    >
                        {dark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
                    </button>
                </div>
            </nav>
            {/* Mobilde Search */}
            <div className="flex md:hidden justify-center px-3 py-2 bg-white/80 dark:bg-[#161921]/90">
                <div className="relative w-full max-w-xs mx-auto">
                    <input
                        type="text"
                        className="w-full py-2 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-[#23263a] text-gray-800 dark:text-white focus:ring-2 ring-indigo-400 outline-none shadow-inner transition"
                        placeholder="Ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 text-lg" />
                </div>
            </div>
        </header>
    );
}
