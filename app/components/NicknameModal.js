// app/components/NicknameModal.js
'use client';

import { useState } from 'react';

export default function NicknameModal({ open, onSubmit }) {
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState(null);

    if (!open) return null;

    const validate = (val) => /^[a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_\-\s]{3,20}$/.test(val);

    const handleSave = () => {
        if (!validate(nickname.trim())) {
            setError('Nick 3-20 harf/rakam, özel karakter yok.');
            return;
        }
        setError(null);
        onSubmit(nickname.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl px-6 py-8 min-w-[320px] max-w-xs flex flex-col items-center gap-3">
                <h2 className="text-xl font-bold mb-2">Bir nick seç</h2>
                <input
                    autoFocus
                    className="border rounded px-3 py-1 w-full bg-transparent outline-none text-center"
                    placeholder="Örn: Sorgulayan_104"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    maxLength={20}
                />
                {error && <div className="text-xs text-red-500">{error}</div>}
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white px-3 py-1.5 rounded mt-3 font-medium"
                >
                    Devam Et
                </button>
            </div>
        </div>
    );
}
