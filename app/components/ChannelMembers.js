// app/components/ChannelMembers.js
'use client';

import { useEffect, useState } from "react";
import { FiUserCheck, FiUser, FiCircle } from "react-icons/fi";

export default function ChannelMembers({ groupId, channelId }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) return;
        fetch(`/api/get-groups?id=${groupId}`)
            .then(res => res.json())
            .then(data => {
                const group = data.groups?.[0];
                if (!group) return setLoading(false);
                setMembers(group.members || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [groupId]);

    // (Simüle çevrimiçi: Rastgele bir kısmı online göster)
    const onlineMembers = members.length > 0
        ? members.slice(0, Math.max(1, Math.floor(members.length / 2)))
        : [];

    if (loading) return (
        <div className="p-4 text-gray-400 text-sm">Üyeler yükleniyor...</div>
    );

    if (!members.length) return (
        <div className="p-4 text-gray-400 text-sm">Bu kanalda henüz üye yok.</div>
    );

    return (
        <div className="bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-800 rounded-xl p-5 mb-4 shadow flex flex-col gap-2">
            <div className="font-bold text-indigo-700 dark:text-indigo-200 flex items-center gap-2 mb-2">
                <FiUserCheck /> Kanal Üyeleri ({members.length})
            </div>
            <ul className="flex flex-wrap gap-3">
                {members.map((nick) => (
                    <li key={nick} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-100 text-sm font-semibold">
                        {onlineMembers.includes(nick) ? (
                            <span title="Çevrimiçi">
                                <FiCircle className="text-green-500 animate-pulse inline mr-1" />
                            </span>
                        ) : (
                            <FiUser className="opacity-40" />
                        )}
                        {nick}
                    </li>
                ))}
            </ul>
        </div>
    );
}
