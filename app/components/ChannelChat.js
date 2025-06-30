'use client';

import { useEffect, useRef, useState } from "react";

export default function ChannelChat({ groupId, channelId }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const nickname = typeof window !== "undefined" ? (localStorage.getItem("nickname") || "Anonim") : "Anonim";

    // Mesajları çek
    const fetchMessages = useCallback(async (showLoading) => {
        if (showLoading) setLoading(true);
        try {
            const res = await fetch(`/api/get-messages?groupId=${groupId}&channelId=${channelId}`);
            const data = await res.json();
            setMessages(data.messages || []);
        } catch {
            setError("Mesajlar yüklenemedi.");
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [groupId, channelId]);

    useEffect(() => {
        fetchMessages(true);
        const timer = setInterval(() => {
            fetchMessages(false);
        }, 3500);
        return () => clearInterval(timer);
    }, [fetchMessages]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Mesaj gönder
    const handleSend = async (e) => {
        e.preventDefault();
        setError("");
        if (!input.trim()) return;
        setSending(true);
        try {
            const res = await fetch('/api/send-message', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId,
                    channelId,
                    nickname,
                    content: input.trim(),
                }),
            });
            const data = await res.json();
            if (data.status === 'ok') {
                setInput("");
                fetchMessages(); // Yenile
            } else {
                setError(data.error || "Mesaj gönderilemedi.");
            }
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[480px] md:h-[600px] border rounded-2xl bg-white/70 dark:bg-zinc-900/80 shadow relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="text-gray-400 text-center mt-10">Yükleniyor...</div>
                ) : messages.length === 0 ? (
                    <div className="text-gray-400 text-center mt-10">Henüz mesaj yok. İlk mesajı sen yaz!</div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className="mb-3 flex flex-col">
                            <span className="font-bold text-indigo-700 dark:text-indigo-200 text-sm">{msg.nickname}</span>
                            <span className="text-gray-800 dark:text-gray-100">{msg.content}</span>
                            <span className="text-xs text-gray-400 mt-1">{new Date(msg.sentAt).toLocaleTimeString()}</span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <form
                onSubmit={handleSend}
                className="flex gap-2 p-3 border-t bg-white/80 dark:bg-zinc-900/90"
                autoComplete="off"
            >
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-indigo-200 dark:border-indigo-700 outline-none bg-transparent"
                    placeholder="Mesajınızı yazın…"
                    maxLength={320}
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-60"
                    disabled={sending || !input.trim()}
                >
                    Gönder
                </button>
            </form>
            {error && <div className="text-red-500 text-xs px-4 pb-2">{error}</div>}
        </div>
    );
}
