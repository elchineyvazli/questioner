// app/components/ResourceTagSuggestions.js
'use client';
import { useState, useEffect } from "react";

export default function ResourceTagSuggestions({ resourceId, currentTags = [] }) {
    const [suggestions, setSuggestions] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [voteLoading, setVoteLoading] = useState({});

    useEffect(() => {
        if (!resourceId) return;
        fetch(`/api/get-resource-tag-suggestions?resourceId=${resourceId}`)
            .then(res => res.json())
            .then(data => setSuggestions(data.suggestions || []));
    }, [resourceId]);

    async function handleSuggestTag(e) {
        e.preventDefault();
        setErr(null);
        if (!newTag || newTag.length < 2) {
            setErr("Etiket çok kısa.");
            return;
        }
        if (currentTags.includes(newTag) || suggestions.find(s => s.tag === newTag)) {
            setErr("Bu etiket zaten önerilmiş veya mevcut.");
            return;
        }
        setLoading(true);
        const res = await fetch('/api/suggest-resource-tag', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resourceId, tag: newTag })
        });
        if (res.ok) {
            setNewTag('');
            setSuggestions(await res.json().then(d => d.suggestions || []));
        } else {
            setErr(await res.text());
        }
        setLoading(false);
    }

    async function handleVote(suggestionId, delta) {
        setVoteLoading(l => ({ ...l, [suggestionId]: true }));
        await fetch('/api/vote-resource-tag-suggestion', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ suggestionId, delta })
        });
        // Yeniden çek
        fetch(`/api/get-resource-tag-suggestions?resourceId=${resourceId}`)
            .then(res => res.json())
            .then(data => setSuggestions(data.suggestions || []));
        setVoteLoading(l => ({ ...l, [suggestionId]: false }));
    }

    return (
        <div className="mt-4">
            <div className="font-bold mb-2">Etiket Önerileri</div>
            <form onSubmit={handleSuggestTag} className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="Yeni etiket öner..."
                    className="px-2 py-1 rounded border flex-1"
                    maxLength={32}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800 transition disabled:opacity-40"
                    disabled={loading}
                >Ekle</button>
            </form>
            {err && <div className="text-red-600 text-xs mb-2">{err}</div>}
            <ul className="space-y-1">
                {suggestions.length === 0 && (
                    <li className="text-gray-400">Hiç öneri yok.</li>
                )}
                {suggestions.map(sug => (
                    <li key={sug.id} className="flex items-center gap-2 text-xs bg-zinc-100 dark:bg-zinc-800 p-1 rounded">
                        <span className="font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700">{sug.tag}</span>
                        <span className="font-mono text-blue-700">{sug.upvotes || 0}</span>
                        <button
                            className="text-green-600 hover:underline disabled:opacity-40"
                            onClick={() => handleVote(sug.id, +1)}
                            disabled={voteLoading[sug.id]}>+1</button>
                        <button
                            className="text-red-500 hover:underline disabled:opacity-40"
                            onClick={() => handleVote(sug.id, -1)}
                            disabled={voteLoading[sug.id]}>–1</button>
                        {sug.upvotes >= 3 && <span className="ml-2 text-green-600 font-semibold">✔️ Oylama Tamam</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
