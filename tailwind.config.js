/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Dark mode class bazlı (dark:...) kullanılacak
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './pages/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
                parla: {
                    '0%,100%': { boxShadow: '0 0 0 0 #ffe066' },
                    '50%': { boxShadow: '0 0 16px 4px #ffe066' }
                    //       }
                },
                animation: {
                    fadeIn: 'fadeIn 0.19s ease',
                    parla: 'parla 2s infinite'
                }
            },
        },
        plugins: [],
    }
}