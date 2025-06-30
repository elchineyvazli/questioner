'use client'
import { FiUsers, FiArrowRight } from "react-icons/fi";

export default function InviteBanner({ onClick }) {
    return (
        <div className="rounded-2xl px-7 py-5 mb-7 bg-gradient-to-r from-indigo-100 to-yellow-50 dark:from-[#23263a] dark:to-[#2e293a] border border-indigo-200 dark:border-indigo-800 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
                <FiUsers className="text-indigo-600 dark:text-indigo-200 text-3xl" />
                <div>
                    <div className="font-bold text-lg text-indigo-800 dark:text-yellow-200">Sorgulayanlar Kulübü’ne Katıl!</div>
                    <div className="text-gray-700 dark:text-gray-300 text-xs max-w-sm">
                        Gerçekten entelektüel, önyargısız tartışmalara <span className="font-bold text-indigo-700 dark:text-yellow-300">davetlisin</span>.
                        Kendi grubunu kurabilir, fikirlerini paylaşabilir veya canlı kanallarda tartışmaya katılabilirsin!
                    </div>
                </div>
            </div>
            <button
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-yellow-400 hover:text-indigo-900 text-white rounded-xl font-bold text-sm shadow transition-all duration-200"
                onClick={onClick}
            >
                Katıl <FiArrowRight />
            </button>
        </div>
    );
}
