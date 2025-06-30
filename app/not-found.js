// app/not-found.js

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl font-bold text-red-600 dark:text-red-400 mb-4">404</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
                Bu sayfa bulunamadı. Belki başka bir tartışma seni bekliyordur?
            </p>
            <Link
                href="/"
                className="mt-6 inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
            >
                Ana Sayfaya Dön
            </Link>
        </div>
    );
}
