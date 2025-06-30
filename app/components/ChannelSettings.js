// app/components/ChannelSettings.js
'use client';

import { useState } from "react";

export default function ChannelSettings({ channel, group, user, onUpdate }) {
    const [name, setName] = useState(channel?.name || "");
    const [desc, setDesc] = useState(channel?.description || "");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Yalnızca grup sahibi/moderatör düzenleyebilir
    const isAdmin = user && (user === group.created_by);
    const nickname = typeof window !== "undefined" ? (localStorage.getItem("nickname") || "Anonim") : "Anonim";

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            const res = await fetch("/api/update-channel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId: group.id,
                    channelId: channel.id,
                    name,
                    description: desc,
                    nickname
                }),
            });
            const data = await res.json();
            if (data.status === "ok") {
                setSuccess("Kanal bilgisi güncellendi.");
                onUpdate && onUpdate();
            } else {
                setError(data.error || "Güncellenemedi.");
            }
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bu kanalı silmek istediğinize emin misiniz?")) return;
        setError("");
        setSuccess("");
        setDeleting(true);
        try {
            const res = await fetch("/api/delete-channel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId: group.id,
                    channelId: channel.id,
                    nickname
                }),
            });
            const data = await res.json();
            if (data.status === "ok") {
                setSuccess("Kanal silindi.");
                onUpdate && onUpdate();
            } else {
                setError(data.error || "Kanal silinemedi.");
            }
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setDeleting(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="text-gray-500 text-sm">
                Bu kanalın ayarlarını yalnızca grup sahibi/moderatör düzenleyebilir.
            </div>
        );
    }

    return (
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow border border-indigo-100 dark:border-indigo-800 max-w-lg">
            <h3 className="font-bold text-lg mb-3">Kanal Ayarları</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
                <label className="font-semibold">Kanal Adı</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="p-2 border rounded bg-transparent border-indigo-300 dark:border-indigo-800"
                    maxLength={32}
                    disabled={saving || deleting}
                    required
                />
                <label className="font-semibold">Açıklama</label>
                <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    className="p-2 border rounded bg-transparent border-indigo-300 dark:border-indigo-800 min-h-[60px]"
                    maxLength={140}
                    disabled={saving || deleting}
                />
                {error && <div className="text-red-500 text-xs">{error}</div>}
                {success && <div className="text-green-500 text-xs">{success}</div>}
                <div className="flex gap-2 mt-2">
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition disabled:opacity-60"
                        disabled={saving || deleting}
                    >
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition disabled:opacity-60 ml-auto"
                        disabled={saving || deleting}
                    >
                        {deleting ? "Siliniyor..." : "Kanalı Sil"}
                    </button>
                </div>
            </form>
        </div>
    );
}
