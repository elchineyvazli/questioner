// app/components/ResourceComments.js
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function ResourceComments({ resourceId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(false);
    const [likeState, setLikeState] = useState({});
    const [flagOpen, setFlagOpen] = useState(null);
    const [flagError, setFlagError] = useState(null);

    const formRef = useRef();

    useEffect(() => {
        if (!resourceId) return;

        const fetchComments = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/get-resource-comments?resourceId=${resourceId}`);
                const data = await res.json();
                setComments(data.comments || []);
            } catch (error) {
                console.error("Yorumlar yüklenirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [resourceId, ok]);

    async function handleSubmit(e) {
        e.preventDefault();
        setErr(null);
        if (!content || content.trim().length < 2) {
            setErr("Yorum çok kısa.");
            return;
        }
        try {
            const res = await fetch('/api/comment-resource', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resourceId, content })
            });
            const data = await res.json();
            if (res.ok) {
                setOk(true);
                setContent('');
                setTimeout(() => setOk(false), 1200);
                fetchComments();
            } else {
                setErr(data.error || "Eklenemedi.");
            }
        } catch {
            setErr("Sunucu hatası.");
        }
    }

    async function handleLike(commentId) {
        setLikeState(l => ({ ...l, [commentId]: "loading" }));
        try {
            const res = await fetch('/api/like-resource-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId })
            });
            const data = await res.json();
            if (res.ok) {
                setLikeState(l => ({ ...l, [commentId]: "liked" }));
                fetchComments();
            } else {
                setLikeState(l => ({ ...l, [commentId]: "error" }));
            }
        } catch {
            setLikeState(l => ({ ...l, [commentId]: "error" }));
        }
    }

    async function handleFlag(commentId, reason) {
        setFlagError(null);
        try {
            const res = await fetch('/api/report-resource-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId, reason })
            });
            const data = await res.json();
            if (res.ok) {
                setFlagOpen(null);
                fetchComments();
            } else {
                setFlagError(data.error || "Raporlanamadı.");
            }
        } catch {
            setFlagError("Sunucu hatası.");
        }
    }

    return (
        <div className="border rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4 mt-4">
            <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    name="content"
                    className="flex-1 border rounded-xl px-3 py-1"
                    placeholder="Yorum ekle…"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    maxLength={300}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-3 py-1 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    Ekle
                </button>
            </form>
            {err && <div className="text-red-600 mb-2">{err}</div>}
            {ok && <div className="text-green-700 mb-2">Yorum eklendi!</div>}
            <div>
                {loading
                    ? <div className="text-gray-400">Yükleniyor…</div>
                    : comments.length === 0
                        ? <div className="text-gray-400">Yorum yok. İlk yorumu sen yaz!</div>
                        : (
                            <ul className="space-y-3">
                                {comments.map(c => {
                                    const flagCount = c.reports?.length || 0;
                                    const flagged = flagCount >= 3;
                                    return (
                                        <li
                                            key={c.id}
                                            className={`p-2 rounded-xl border relative group ${flagged ? 'bg-red-100 text-gray-400 dark:bg-red-900/60' : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100'}`}
                                            style={{ opacity: flagged ? 0.7 : 1 }}
                                        >
                                            <div className="font-mono text-xs mb-0.5">
                                                {c.by?.slice(0, 8)}… <span className="mx-1">·</span> {c.createdAt.slice(0, 16).replace('T', ' ')}
                                                {flagged && (
                                                    <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-900 rounded text-xs font-bold">Topluluğa kapalı</span>
                                                )}
                                            </div>
                                            <div>
                                                {!flagged ? c.content : <i className="italic">Bu yorum çoklu rapor nedeniyle gizlenmiştir.</i>}
                                            </div>
                                            {!flagged && (
                                                <div className="absolute right-2 top-2 flex gap-2 opacity-70 group-hover:opacity-100 transition">
                                                    <button
                                                        title="Beğen"
                                                        disabled={likeState[c.id] === "loading"}
                                                        onClick={() => handleLike(c.id)}
                                                        className={`text-lg px-1 ${likeState[c.id] === "liked" ? "text-blue-600" : "text-gray-400 hover:text-blue-600"} transition`}
                                                    >👍 {c.likes?.length || 0}</button>
                                                    <div className="relative inline-block">
                                                        <button
                                                            title="Raporla"
                                                            onClick={() => setFlagOpen(flagOpen === c.id ? null : c.id)}
                                                            className={`text-lg px-1 ${c.reports && c.reports.length > 0 ? "text-red-500" : "text-gray-400 hover:text-red-600"} transition`}
                                                        >⚑</button>
                                                        {flagOpen === c.id && (
                                                            <div className="absolute z-50 right-0 mt-2 min-w-[160px] bg-white dark:bg-zinc-900 border rounded shadow-lg text-xs p-2">
                                                                <div className="mb-1 font-bold">Raporla</div>
                                                                <button className="block w-full text-left hover:bg-red-50 px-2 py-1 rounded"
                                                                    onClick={() => handleFlag(c.id, "spam")}>Spam/Alakasız</button>
                                                                <button className="block w-full text-left hover:bg-red-50 px-2 py-1 rounded"
                                                                    onClick={() => handleFlag(c.id, "toksik")}>Toksik/Hakaret</button>
                                                                <button className="block w-full text-left hover:bg-red-50 px-2 py-1 rounded"
                                                                    onClick={() => handleFlag(c.id, "yanlış")}>Yanıltıcı/Yanlış</button>
                                                                <button className="block w-full text-left hover:bg-red-50 px-2 py-1 rounded"
                                                                    onClick={() => handleFlag(c.id, "diğer")}>Diğer…</button>
                                                                {flagError && <div className="text-red-500 mt-1">{flagError}</div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                        )}
            </div>
        </div>
    );
}
