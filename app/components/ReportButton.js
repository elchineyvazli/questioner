'use client';
import { useState } from 'react';

export default function ReportButton({ resourceId }) {
    const [open, setOpen] = useState(false);
    const [sent, setSent] = useState(false);
    const [err, setErr] = useState(null);

    const handleReport = async (reason) => {
        setErr(null);
        try {
            const res = await fetch('/api/report-resource', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceId,
                    reason,
                })
            });
            if (res.ok) {
                setSent(true);
                setTimeout(() => { setOpen(false); setSent(false); }, 1200);
            } else {
                const data = await res.json();
                setErr(data.error || "Hata");
            }
        } catch {
            setErr("Sunucu hatası");
        }
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen(o => !o)}
                className="px-2 py-1 text-xs text-gray-400 hover:text-red-600 transition rounded-full border border-transparent hover:border-red-400"
                title="Kaynağı raporla"
            >⚑</button>
            {open && (
                <div className="absolute z-40 right-0 mt-2 min-w-[180px] bg-white dark:bg-zinc-900 border rounded shadow-lg text-xs p-3 animate-fade-in">
                    {sent ? (
                        <span className="text-green-600 font-semibold">Raporlandı!</span>
                    ) : (
                        <>
                            <div className="mb-1 font-bold text-gray-700 dark:text-gray-200">Kaynağı raporla</div>
                            <button
                                onClick={() => handleReport("spam")}
                                className="block w-full text-left hover:bg-red-50 dark:hover:bg-zinc-800 px-2 py-1 rounded">Spam/Alakasız</button>
                            <button
                                onClick={() => handleReport("toksik")}
                                className="block w-full text-left hover:bg-red-50 dark:hover:bg-zinc-800 px-2 py-1 rounded">Toksik/Hakaret</button>
                            <button
                                onClick={() => handleReport("yanlış")}
                                className="block w-full text-left hover:bg-red-50 dark:hover:bg-zinc-800 px-2 py-1 rounded">Yanıltıcı/Yanlış</button>
                            <button
                                onClick={() => handleReport("diğer")}
                                className="block w-full text-left hover:bg-red-50 dark:hover:bg-zinc-800 px-2 py-1 rounded">Diğer…</button>
                            {err && <div className="text-red-500 mt-1">{err}</div>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
