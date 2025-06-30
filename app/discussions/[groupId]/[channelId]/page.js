// app/discussions/[groupId]/[channelId]/page.js
'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ChannelChat from "@/app/components/ChannelChat";

export default function ChannelDetailPage() {
    const { groupId, channelId } = useParams();
    const router = useRouter();

    const [group, setGroup] = useState(null);
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gerekli grup ve kanal verilerini çek
        fetch(`/api/get-groups?id=${groupId}`)
            .then(res => res.json())
            .then(data => {
                const grp = data.groups?.[0] || null;
                setGroup(grp);
                if (grp) {
                    const ch = grp.channels.find(ch => ch.id === channelId);
                    setChannel(ch || null);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [groupId, channelId]);

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Yükleniyor...</div>;
    }
    if (!group || !channel) {
        return (
            <div className="p-10 text-center text-red-500">
                Kanal veya grup bulunamadı.
                <button onClick={() => router.back()} className="ml-4 underline">Geri dön</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-5">
            <div className="mb-2">
                <button
                    onClick={() => router.push(`/discussions/${groupId}`)}
                    className="text-xs text-indigo-600 dark:text-indigo-200 underline hover:opacity-70"
                >
                    &larr; Gruba Geri Dön
                </button>
            </div>
            <div>
                <h1 className="text-2xl font-black text-indigo-700 dark:text-indigo-200 mb-1">
                    #{channel.name}
                </h1>
                <div className="text-gray-500 dark:text-gray-300 text-sm mb-2">
                    {channel.topic || channel.description || "Kanal hakkında bilgi yok."}
                </div>
            </div>
            {/* Chat alanı */}
            <ChannelChat groupId={groupId} channelId={channelId} />
        </div>
    );
}
