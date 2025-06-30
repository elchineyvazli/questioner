'use client';
import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState('system');

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            setTheme(stored);
            document.documentElement.classList.add(stored === 'dark' ? 'dark' : 'light');
            document.documentElement.classList.remove(stored === 'dark' ? 'light' : 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme('system');
            document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
            document.documentElement.classList.remove(prefersDark ? 'light' : 'dark');
        }
    }, []);

    const toggleTheme = () => {
        let next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('theme', next);

        document.documentElement.classList.add(next);
        document.documentElement.classList.remove(next === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            aria-label="Tema değiştir"
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 z-50 bg-gray-200 dark:bg-zinc-800 rounded-full p-2 shadow-lg hover:scale-110 transition"
            title="Tema değiştir"
        >
            {theme === 'dark' ? (
                // Güneş ikonu
                <svg width={20} height={20} viewBox="0 0 24 24" fill="yellow">
                    <path d="M12 3v1m0 16v1m8.66-12.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 4.95l-.71-.71M6.34 6.34l-.71-.71" />
                </svg>
            ) : (
                // Ay ikonu
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="orange" strokeWidth={2}>
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2m0 18v2m10-10h-2M4 12H2m16.66 4.95l-1.42-1.42M6.34 6.34L4.92 4.92m12.02 12.02l1.42 1.42M6.34 17.66l-1.42 1.42" />
                </svg>
            )}
        </button>
    );
}
