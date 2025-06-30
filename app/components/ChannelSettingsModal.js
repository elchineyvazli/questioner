// app/components/ChannelSettingsModal.js
'use client';

import ChannelSettings from "./ChannelSettings";
import { FiX } from "react-icons/fi";

export default function ChannelSettingsModal({ open, onClose, channel, group, user, onUpdated }) {
    if (!open || !channel) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full px-6 py-7 border-2 border-indigo-200 dark:border-indigo-700 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-lg font-bold"
                    aria-label="Kapat"
                >
                    <FiX />
                </button>
                <ChannelSettings
                    channel={channel}
                    group={group}
                    user={user}
                    onUpdate={onUpdated}
                />
            </div>
        </div>
    );
}
