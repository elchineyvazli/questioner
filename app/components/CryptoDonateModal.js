// app/components/CryptoDonateModal.js
'use client';
import { useState } from 'react';

export default function CryptoDonateModal({ open, onClose }) {
    const [amount, setAmount] = useState("");
    const [nickname, setNickname] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    if (!open) return null;

    const handleDonate = async () => {
        setError("");
        const n = parseFloat(amount);
        if (isNaN(n) || n < 1) {
            setError("Lütfen geçerli bir miktar girin.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/crypto-donate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: n, nickname, message })
            });
            const data = await res.json();
            if (data.status === "ok") {
                setResult(data);
            } else {
                setError(data.error || "Hata oluştu");
            }
        } catch {
            setError("Sunucuya bağlanılamadı");
        } finally {
            setLoading(false);
        }
    };

    const checkDonation = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/check-crypto-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ donationId: result.donationId }),
            });
            const data = await res.json();
            if (data.status === "confirmed") {
                alert("✅ Katkın başarıyla alındı. Teşekkür ederiz!");
                onClose();
            } else {
                setError("Henüz ödeme alınmamış gibi görünüyor. Lütfen birkaç dakika sonra tekrar deneyin.");
            }
        } catch {
            setError("Bağlantı hatası. Daha sonra tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-3 text-center text-yellow-600 dark:text-yellow-300">
                    Kripto ile Destekle
                </h2>

                {!result ? (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleDonate();
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
                ) : (
                    <div className="text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                            Lütfen aşağıdaki cüzdana <b>{amount}</b> değerinde <b>USDT (TRC20)</b> gönderin:
                        </div>
                        <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded font-mono text-sm break-all select-all border border-gray-300 dark:border-zinc-700">
                            {result?.cryptoAddress || "Adres alınamadı"}
                        </div>
                        <div className="text-xs text-gray-500 mt-3">
                            Not: İşlemin ağda görünmesi birkaç dakika sürebilir.
                        </div>

                        <button
                            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded disabled:opacity-60"
                            onClick={checkDonation}
                            disabled={loading}
                        >
                            {loading ? "Kontrol ediliyor..." : "USDT Gönderdim"}
                        </button>

                        {error && (
                            <div className="mt-2 text-sm text-red-500">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-red-500 w-full">
                    Kapat
                </button>
            </div>
        </div>
    );
}
