'use client';

import { useState, useEffect, useRef } from 'react';
import DonateOptionsModal from './DonateOptionsModal.js';
import NicknameModal from '../components/NicknameModal';
import ProfileHoverCard from '../components/ProfileHoverCard';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const [nickname, setNickname] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [donateOpen, setDonateOpen] = useState(false);
    const [showNickModal, setShowNickModal] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [cryptoResult, setCryptoResult] = useState(null);
    const [cryptoError, setCryptoError] = useState("");
    const menuRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('nickname');
        if (stored) setNickname(stored);

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNicknameSubmit = (nick) => {
        setNickname(nick);
        localStorage.setItem('nickname', nick);
        setShowNickModal(false);
    };

    const goToProfile = () => {
        const nick = isAuthenticated ? session.user.name : nickname;
        if (nick) router.push(`/profile/${encodeURIComponent(nick)}`);
        setShowMenu(false);
    };

    const handleUserSearch = (e) => {
        e.preventDefault();
        const trimmed = searchValue.trim();
        if (trimmed.length > 2) {
            router.push(`/search?user=${encodeURIComponent(trimmed)}`);
            setSearchValue('');
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-40 flex items-center justify-between bg-white/80 dark:bg-[#191926]/80 backdrop-blur-md shadow-md px-6 py-2 h-14">
                <div className="flex items-center gap-2 font-extrabold tracking-wide text-lg select-none">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 shadow-sm flex items-center justify-center text-white text-xl">
                        🧠
                    </div>
                    <span className="ml-1 text-[#fd8601] dark:text-[#a882fc]">Questioner</span>
                    <Link href="/" className="ml-5 px-3 py-1 rounded text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-zinc-800 transition">
                        Ana Sayfa
                    </Link>
                    <Link href="/resources" className="px-3 py-1 rounded text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-zinc-800 transition">
                        Kaynaklar
                    </Link>
                </div>

                <form onSubmit={handleUserSearch} className="hidden md:flex flex-1 justify-center items-center mx-8">
                    <input
                        type="text"
                        placeholder="Kullanıcı ara…"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        className="w-80 max-w-xs px-4 py-1.5 rounded-2xl bg-white/70 dark:bg-[#252544] border border-indigo-100 dark:border-indigo-800 shadow focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 text-base text-gray-800 dark:text-gray-100 transition-all duration-200 placeholder:italic placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        minLength={3}
                        maxLength={24}
                    />
                </form>

                <div className="flex items-center gap-6 relative">
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(v => !v)}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fd8601] to-[#a882fc] flex items-center justify-center shadow border-2 border-white dark:border-[#18181a] focus:outline-none transition hover:scale-105"
                            aria-label="Profil menüsü"
                        >
                            <span className="text-xl font-bold text-white select-none">
                                {isAuthenticated ? session.user.name[0].toUpperCase() : nickname ? nickname[0].toUpperCase() : 'A'}
                            </span>
                        </button>

                        {showMenu && (
                            <div className="absolute top-12 right-0 w-56 bg-white dark:bg-[#27273a] rounded-xl shadow-xl p-4 z-50 border border-orange-200 dark:border-purple-900 animate-fadein min-h-[100px]">
                                <ProfileHoverCard nickname={isAuthenticated ? session.user.name : (nickname || 'Anonim')}>
                                    <div className="text-xs text-gray-700 dark:text-gray-200 font-semibold mb-2">
                                        {isAuthenticated ? (
                                            <>Hoş geldin, <span className="text-orange-500 dark:text-purple-300">{session.user.name}</span></>
                                        ) : nickname ? (
                                            <>Hoş geldin, <span className="text-orange-500 dark:text-purple-300">{nickname}</span></>
                                        ) : (
                                            <>Henüz bir takma adın yok!</>
                                        )}
                                    </div>
                                </ProfileHoverCard>

                                <button
                                    onClick={goToProfile}
                                    className="w-full text-left text-xs py-2 px-3 rounded bg-indigo-50 dark:bg-[#2b2b4b] hover:bg-indigo-100 dark:hover:bg-[#343456] font-semibold transition"
                                >
                                    Profil Sayfası
                                </button>

                                {isAuthenticated ? (
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full text-left text-xs mt-2 py-2 px-3 rounded bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-700 font-semibold transition"
                                    >
                                        Çıkış yap
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowNickModal(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left text-xs mt-2 py-2 px-3 rounded bg-orange-50 dark:bg-[#2c234c] hover:bg-orange-100 dark:hover:bg-[#34295a] font-semibold transition"
                                        >
                                            {nickname ? 'Takma adı değiştir' : 'Takma adını ayarla'}
                                        </button>
                                        <button
                                            onClick={() => signIn('google')}
                                            className="w-full text-left text-xs mt-2 py-2 px-3 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 font-semibold transition"
                                        >
                                            Google ile Giriş Yap
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setDonateOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-indigo-400 text-white rounded-2xl font-bold text-sm shadow-lg ml-3 ring-2 ring-yellow-200 dark:ring-pink-400 hover:scale-105 hover:ring-4 transition-all duration-200 animate-pulse"
                        style={{ animationDuration: '2.5s' }}
                    >
                        <span className="inline-block animate-bounce mr-1">💎</span> Destekçi Ol
                    </button>
                </div>
            </nav>

            <DonateOptionsModal
                open={donateOpen}
                onClose={() => {
                    setDonateOpen(false);
                    setCryptoResult(null);
                    setCryptoError("");
                }}
                cryptoResult={cryptoResult}
                setCryptoResult={setCryptoResult}
                cryptoError={cryptoError}
                setCryptoError={setCryptoError}
            />
            <NicknameModal open={showNickModal} onSubmit={handleNicknameSubmit} />
        </>
    );
}
