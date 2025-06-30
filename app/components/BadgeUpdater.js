'use client';

import { useState } from 'react';

export default function BadgeUpdater() {
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleUpdate = async () => {
        if (!nickname.trim()) {
            setError('Takma ad boş olamaz.');
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const res = await fetch('/api/update-user-badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname: nickname.trim() })
            });

            const data = await res.json();

            if (res.ok && data.status === 'ok') {
                setMessage(`Rozetler başarıyla güncellendi: [${data.badges.join(', ')}]`);
            } else {
                setError(data.error || 'Rozet güncellenemedi.');
            }
        } catch (err) {
            setError('Sunucu hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <input
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Kullanıcı takma adını girin"
                className="px-4 py-2 w-full border rounded text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                disabled={loading}
            />
            <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-orange-600 text-white px-4 py-2 text-sm rounded hover:bg-orange-700 transition disabled:opacity-50"
            >
                {loading ? 'Güncelleniyor...' : 'Rozetleri Güncelle'}
            </button>

            {message && <div className="text-green-600 text-sm">{message}</div>}
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
}
