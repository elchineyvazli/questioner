'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChannelChat from '../../components/ChannelChat';
import StartChannelModal from '../../components/StartChannelModal';
import ChannelSettingsModal from '../../components/ChannelSettingsModal';
import { FiSettings } from 'react-icons/fi';

export default function GroupPage() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState('');
    const [nickname, setNickname] = useState('');
    const [activeChannel, setActiveChannel] = useState(null);
    const [showStartChannel, setShowStartChannel] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);

    useEffect(() => {
        const fetchGroup = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/get-groups?id=${groupId}`);
                const data = await res.json();
                const groupObj = data.groups?.[0] || null;
                setGroup(groupObj);
                setActiveChannel(null);
                if (groupObj?.channels?.length) {
                    setActiveChannel(groupObj.channels[0].id);
                }
            } catch (err) {
                console.error("fetchGroup error:", err);
                setGroup(null);
                setError("Grup verileri alınamadı.");
            } finally {
                setLoading(false);
            }
        };

        setNickname(localStorage.getItem('nickname') || '');
        fetchGroup();
    }, [groupId]);

    const handleJoin = async () => {
        if (!nickname) {
            setError("Katılmak için önce takma ad belirleyin!");
            return;
        }
        setJoining(true);
        setError('');
        try {
            const res = await fetch('/api/join-group', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId, nickname })
            });
            const data = await res.json();
            if (data.status === 'ok' || data.status === 'already-member') {
                setJoined(true);
                await fetchGroup();
            } else {
                setError(data.error || "Bir hata oluştu.");
            }
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Yükleniyor...</div>;
    }
    if (!group) {
        return <div className="p-10 text-center text-red-500">Grup bulunamadı.</div>;
    }

    const isMember = (group.members || []).includes(nickname) || joined;
    const isOwner = nickname === group.created_by;

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-extrabold text-indigo-800 dark:text-indigo-200 mb-2">
                {group.name}
            </h1>
            <div className="text-gray-700 dark:text-gray-200 mb-4">{group.description}</div>
            <div className="text-sm text-gray-500 mb-4">
                Kurucu: <b>{group.created_by}</b> | Üye: <b>{group.members?.length || 0}</b>
            </div>

            {!isMember && !isOwner && (
                <button
                    onClick={handleJoin}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow transition mb-3"
                    disabled={joining}
                >
                    {joining ? "Katılıyor..." : "Gruba Katıl"}
                </button>
            )}
            {isMember && (
                <div className="px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-200 font-bold mb-3">
                    Gruba katıldınız!
                </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="mt-5 mb-8">
                <h3 className="font-bold mb-1 text-gray-700 dark:text-gray-200">Üyeler</h3>
                <div className="flex flex-wrap gap-2">
                    {(group.members || []).map((member, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-100 text-xs font-bold">
                            <span className="mr-1">👤</span>{member}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-bold text-lg">Kanallar</h2>
                    {isMember && (
                        <button
                            onClick={() => setShowStartChannel(true)}
                            className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold shadow"
                        >
                            + Kanal Aç
                        </button>
                    )}
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                    {group.channels?.length ? (
                        group.channels.map(channel => (
                            <div key={channel.id} className="flex items-center gap-1">
                                <button
                                    onClick={() => setActiveChannel(channel.id)}
                                    className={`px-4 py-2 rounded-lg font-bold transition border
                                        ${activeChannel === channel.id
                                            ? "bg-indigo-600 text-white border-indigo-700 shadow"
                                            : "bg-indigo-50 dark:bg-zinc-900/40 text-indigo-800 dark:text-indigo-100 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"}
                                    `}
                                >
                                    #{channel.name}
                                </button>
                                <button
                                    className="ml-1 p-1 rounded hover:bg-indigo-100 dark:hover:bg-zinc-800 text-indigo-500"
                                    title="Kanal ayarları"
                                    onClick={() => {
                                        setSelectedChannel(channel);
                                        setSettingsOpen(true);
                                    }}
                                >
                                    <FiSettings />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 italic">Henüz kanal yok.</div>
                    )}
                </div>

                {isMember && activeChannel ? (
                    <ChannelChat groupId={groupId} channelId={activeChannel} />
                ) : isMember ? (
                    <div className="text-center text-gray-500 italic">Aktif bir kanal seçin.</div>
                ) : (
                    <div className="text-gray-500 text-center py-10 italic">
                        Kanalları ve sohbeti görmek için önce gruba katılmalısın.
                    </div>
                )}
            </div>

            {isMember && (
                <StartChannelModal
                    open={showStartChannel}
                    onClose={() => setShowStartChannel(false)}
                    onCreated={() => {
                        setShowStartChannel(false);
                        fetchGroup();
                    }}
                />
            )}
            <ChannelSettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                channel={selectedChannel}
                group={group}
                user={nickname}
                onUpdated={fetchGroup}
            />
        </div>
    );
}
