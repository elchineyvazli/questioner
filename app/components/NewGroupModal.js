'use client';

import { useState } from "react";
import { FiUsers, FiLock, FiGlobe, FiX } from "react-icons/fi";
import { useSession } from 'next-auth/react';

export default function NewGroupModal({ open, onClose, onCreated }) {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!open) return null;

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || name.length < 3) {
            setError('Grup adı en az 3 karakter olmalı.');
            return;
        }
        setLoading(true);
        try {
            // Kurucu bilgisini belirle
            let creator = '';
            if (session?.user?.name) {
                creator = session.user.name;
            } else {
                creator = localStorage.getItem('nickname') || '';
            }
            if (!creator) {
                setError('Bir kullanıcı adı gerekli (giriş yapmalı veya nick seçilmeli).');
                setLoading(false);
                return;
            }
            const res = await fetch('/api/create-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: desc.trim(),
                    isPrivate: privacy === "private",
                    tags: [],
                    creator
                })
            });
            const data = await res.json();
            if (res.ok && data.group) {
                onCreated && onCreated(data.group);
                setName('');
                setDesc('');
                setPrivacy('public');
                setError('');
                setLoading(false);
                onClose();
            } else {
                setError(data.error || 'Grup oluşturulamadı.');
                setLoading(false);
            }
        } catch (err) {
            setError('Bir hata oluştu.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full px-7 py-7 border-2 border-indigo-200 dark:border-indigo-700 animate-fade-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-lg font-bold"
                    aria-label="Kapat"
                >
                    <FiX />
                </button>
                <div className="text-xl font-black text-indigo-700 dark:text-indigo-200 mb-2 flex gap-2 items-center">
                    <FiUsers /> Yeni Grup Oluştur
                </div>
                <form onSubmit={handleCreate} className="flex flex-col gap-3 mt-3">
                    <input
                        type="text"
                        placeholder="Grup Adı"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="p-2 border rounded bg-transparent border-indigo-300 dark:border-indigo-800"
                        maxLength={32}
                        disabled={loading}
                        required
                    />
                    <textarea
                        placeholder="Açıklama (isteğe bağlı)"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="p-2 border rounded bg-transparent border-indigo-300 dark:border-indigo-800 min-h-[60px]"
                        maxLength={140}
                        disabled={loading}
                    />
                    <div className="flex gap-4 my-2">
                        <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border ${privacy === "public" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 font-bold" : "border-gray-200 dark:border-gray-700"}`}>
                            <input
                                type="radio"
                                name="privacy"
                                value="public"
                                checked={privacy === "public"}
                                onChange={() => setPrivacy('public')}
                                className="accent-indigo-600"
                                disabled={loading}
                            />
                            <FiGlobe className="text-indigo-500" />
                            Herkese Açık
                        </label>
                        <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border ${privacy === "private" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 font-bold" : "border-gray-200 dark:border-gray-700"}`}>
                            <input
                                type="radio"
                                name="privacy"
                                value="private"
                                checked={privacy === "private"}
                                onChange={() => setPrivacy('private')}
                                className="accent-indigo-600"
                                disabled={loading}
                            />
                            <FiLock className="text-indigo-500" />
                            Özel
                        </label>
                    </div>
                    {error && <div className="text-red-500 text-xs">{error}</div>}
                    <button
                        className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 font-black text-lg shadow-xl transition-all duration-200 disabled:opacity-60"
                        disabled={loading}
                        type="submit"
                    >
                        {loading ? "Oluşturuluyor..." : "Grubu Oluştur"}
                    </button>
                </form>
            </div>
        </div>
    );
}
