// app/components/ResourceAIButton.js
'use client';
import { useState } from 'react';

export default function ResourceAIButton({ resource, afterTag }) {
    const [status, setStatus] = useState("idle"); // idle, loading, done, error
    const [aiResult, setAiResult] = useState(resource?.aiSummary || "");

    const handleTag = async () => {
        setStatus("loading");
        try {
            const res = await fetch('/api/ai-tag-resource', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceId: resource.id,
                    pdfUrl: resource.pdfUrl || null,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setStatus("done");
                setAiResult(data.aiResult?.summary || "");
                if (afterTag) afterTag(); // Panelde veri tazelemek için
                setTimeout(() => setStatus("idle"), 2000);
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <div className="inline-flex flex-col items-end space-y-1">
            <button
                className={`px-2 py-1 rounded-xl text-xs font-semibold border transition
                ${status === "loading" ? "bg-blue-100 text-blue-800 animate-pulse" :
                        status === "done" ? "bg-green-100 text-green-800" :
                            status === "error" ? "bg-red-100 text-red-800" :
                                "bg-zinc-100 text-zinc-700 hover:bg-blue-100 hover:text-blue-900"}
                `}
                disabled={status === "loading"}
                onClick={handleTag}
                title="AI ile otomatik etiketle ve özetle"
            >
                {status === "loading" ? "Etiketleniyor…" :
                    status === "done" ? "✔️ AI Tag" :
                        status === "error" ? "Hata!" : "AI Tag"}
            </button>
            {/* AI özeti varsa göster */}
            {aiResult &&
                <div className="max-w-xs text-xs text-zinc-600 bg-zinc-50 border rounded-xl px-2 py-1 mt-1 shadow
                    dark:bg-zinc-900 dark:text-zinc-200">
                    <span className="font-bold text-blue-900 dark:text-blue-300">AI Özet: </span>
                    {aiResult.length > 150 ? aiResult.slice(0, 150) + "…" : aiResult}
                </div>
            }
        </div>
    );
}
