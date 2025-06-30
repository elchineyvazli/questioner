'use client';
import { useEffect, useState } from 'react';
import CommentCard from '../components/CommentCard';

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
    { label: 'En Yeni', value: 'newest' },
    { label: 'En Eski', value: 'oldest' },
    { label: 'En Uzun', value: 'longest' },
    { label: 'En Kısa', value: 'shortest' }
];

export default function CommentsPage() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [filtered, setFiltered] = useState([]);
    const [nicknameFilter, setNicknameFilter] = useState('');

    // Fetch all comments once
    useEffect(() => {
        setLoading(true);
        fetch('/api/get-all-comments')
            .then(res => res.json())
            .then(data => {
                setComments(data.comments || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Filtreleme & Sıralama
    useEffect(() => {
        let result = comments;
        // Arama
        if (search.trim()) {
            result = result.filter(c =>
                c.content?.toLowerCase().includes(search.toLowerCase()) ||
                c.nickname?.toLowerCase().includes(search.toLowerCase())
            );
        }
        // Nickname filtresi (isteğe bağlı)
        if (nicknameFilter.trim()) {
            result = result.filter(c =>
                c.nickname?.toLowerCase() === nicknameFilter.toLowerCase()
            );
        }
        // Sıralama
        if (sort === 'newest') result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (sort === 'oldest') result = result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        else if (sort === 'longest') result = result.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
        else if (sort === 'shortest') result = result.sort((a, b) => (a.content?.length || 0) - (b.content?.length || 0));
        setFiltered(result);
        setPage(1); // Arama/filtre değişince ilk sayfaya dön
    }, [search, sort, comments, nicknameFilter]);

    // Pagination hesapla
    const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="max-w-3xl mx-auto px-2 py-8">
            <h1 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-200">Yorumlar</h1>
            {/* Arama ve filtre */}
            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Yorumda veya kullanıcıda ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="p-2 border rounded bg-white dark:bg-zinc-900"
                    style={{ minWidth: 180 }}
                />
                <input
                    type="text"
                    placeholder="Kullanıcı adı filtrele"
                    value={nicknameFilter}
                    onChange={e => setNicknameFilter(e.target.value)}
                    className="p-2 border rounded bg-white dark:bg-zinc-900"
                    style={{ minWidth: 150 }}
                />
                <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="p-2 border rounded bg-white dark:bg-zinc-900"
                >
                    {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            {/* Yorumlar */}
            {loading ? (
                <div className="text-center text-gray-400 py-16">Yükleniyor...</div>
            ) : paginated.length === 0 ? (
                <div className="text-center text-gray-400 py-16">Hiç yorum bulunamadı.</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {paginated.map((c, i) => <CommentCard key={c.id || i} comment={c} />)}
                </div>
            )}
            {/* Pagination */}
            <div className="flex gap-1 mt-8 justify-center">
                {Array.from({ length: pageCount }).map((_, i) => (
                    <button
                        key={i}
                        className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center border 
              ${page === i + 1
                                ? "bg-yellow-400 text-white border-yellow-600"
                                : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-zinc-700 hover:bg-yellow-100"
                            }`}
                        onClick={() => setPage(i + 1)}
                        disabled={page === i + 1}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
