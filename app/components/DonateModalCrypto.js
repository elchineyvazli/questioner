// app/components/DonateModalCrypto.js
'use client';

import { useState } from 'react';

export default function DonateModalCrypto({ open, onClose }) {
    const [amount, setAmount] = useState('');
    const [nickname, setNickname] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [response, setResponse] = useState(null);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                <button
                    className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl"
                    onClick={onClose}
                >
                    ×
                </button>

                <h2 className="text-xl font-bold text-center text-yellow-600 dark:text-yellow-300 mb-4">
                    Kripto ile Destek Ol
                </h2>

                {response ? (
                    <div className="text-center text-sm text-gray-700 dark:text-gray-300">
                        <p className="mb-2">Aşağıdaki cüzdan adresine <b>{amount} USDT</b> gönder:</p>
                        <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg break-all font-mono text-sm">
                            {response.cryptoAddress}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Bağışın doğrulandığında kaydedilecektir.</p>
                    </div>
                ) : (
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setError('');
                            const n = parseFloat(amount);
                            if (isNaN(n) || n < 1) {
                                setError('En az 1 USDT bağış yapabilirsiniz.');
                                return;
                            }
                            setLoading(true);
                            try {
                                const res = await fetch('/api/crypto-donate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ amount: n, nickname, message })
                                });
                                const data = await res.json();
                                if (data.status === 'ok') {
                                    setResponse(data);
                                } else {
                                    setError(data.error || 'Hata oluştu.');
                                }
                            } catch {
                                setError('Sunucu hatası');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="flex flex-col gap-3"
                    >
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="Bağış miktarı (USDT)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="p-2 border rounded border-yellow-300 dark:border-yellow-600 bg-transparent"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Takma ad (isteğe bağlı)"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-transparent"
                            maxLength={30}
                        />
                        <input
                            type="text"
                            placeholder="Mesajın (isteğe bağlı)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-transparent"
                            maxLength={60}
                        />
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-xl font-bold transition-all"
                        >
                            {loading ? 'Gönderiliyor...' : 'Kripto ile Destek Ol'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
