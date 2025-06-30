'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { FiSearch, FiLoader, FiUpload, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import UploadResourceModal from '../components/UploadResourceModal';

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [sortKey, setSortKey] = useState('addedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [loading, setLoading] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const searchTimeout = useRef();

    // Kaynakları getir
    const fetchResources = () => {
        setLoading(true);
        fetch('/api/get-resources')
            .then(res => res.json())
            .then(data => {
                setResources(data.resources || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const sortedResources = useMemo(() => {
        return [...resources].sort((a, b) => {
            // Tarih sıralaması
            if (sortKey === 'addedAt') {
                return sortOrder === 'asc'
                    ? new Date(a.addedAt) - new Date(b.addedAt)
                    : new Date(b.addedAt) - new Date(a.addedAt);
            }

            // Metin sıralaması (name, summary gibi alanlar için)
            if (typeof a[sortKey] === 'string') {
                return sortOrder === 'asc'
                    ? a[sortKey].localeCompare(b[sortKey])
                    : b[sortKey].localeCompare(a[sortKey]);
            }

            // Sayısal sıralama (reliability gibi alanlar için)
            return sortOrder === 'asc'
                ? a[sortKey] - b[sortKey]
                : b[sortKey] - a[sortKey];
        });
    }, [resources, sortKey, sortOrder]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    useEffect(() => {
        if (!search.trim()) {
            setSearchResults(null);
            return;
        }
        setSearching(true);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch('/api/ai-search-resources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: search.trim() }),
                });
                const data = await res.json();
                setSearchResults(Array.isArray(data.results) ? data.results : []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 500);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    const displayedResources = search && !searching ? searchResults : sortedResources;

    const handleFileAction = async (filename, action) => {
        try {
            const res = await fetch(
                `/api/get-file-url?filename=${encodeURIComponent(filename)}&action=${action}`
            );
            const { url } = await res.json();

            if (action === 'view') {
                // Yeni sekmede görüntüle (indirme yapmadan)
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                // Zorunlu indirme
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('File action error:', error);
            alert(`Dosya ${action === 'view' ? 'görüntülenirken' : 'indirilirken'} hata oluştu`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📚 Kaynaklar</h1>
                <button
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-500 rounded hover:scale-105 transition"
                >
                    <FiUpload />
                    Yeni Kaynak Yükle
                </button>
            </div>

            <div className="mb-6">
                <div className="bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-lg p-4 shadow-sm flex items-center gap-4">
                    <FiSearch className="text-blue-600 dark:text-blue-300 text-xl" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="AI destekli arama (örn: 'felsefe etik pdf')"
                        className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                    {searching && (
                        <span className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300 animate-pulse">
                            <FiLoader className="animate-spin" /> Aranıyor…
                        </span>
                    )}
                    {!searching && !!search && (
                        <span className="text-xs text-gray-400 dark:text-gray-600 italic">Sonuçlar AI ile getiriliyor</span>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-zinc-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                        <thead className="bg-gray-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('name')}>
                                    <div className="flex items-center">
                                        Adı & Özet
                                        {sortKey === 'name' && (sortOrder === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />)}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Etiketler
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Rozetler
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Güvenilirlik
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Ekleyen
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('addedAt')}>
                                    <div className="flex items-center">
                                        Eklenme Tarihi
                                        {sortKey === 'addedAt' && (sortOrder === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />)}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center">
                                        <FiLoader className="animate-spin mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : displayedResources?.length > 0 ? (
                                displayedResources.map(resource => (
                                    <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                                        {/* Adı & Özet */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            <div>{resource.name}</div>
                                        </td>
                                        {/* Etiketler */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {resource.tags?.map(tag => (
                                                    <span key={tag} className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        {/* Rozetler */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-1 flex-wrap">
                                                {resource.badges?.map(badge => (
                                                    <span key={badge} className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        {/* Güvenilirlik */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="font-semibold">{resource.reliability ?? '-'}</span>
                                        </td>
                                        {/* Ekleyen */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {resource.uploader || "Anonim"}
                                        </td>
                                        {/* Eklenme Tarihi */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {resource.addedAt ? new Date(resource.addedAt).toLocaleDateString() : "-"}
                                        </td>
                                        {/* İşlemler */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                                            <button
                                                onClick={() => handleFileAction(resource.pdfUrl.split('/').pop(), 'view')}
                                                className="hover:underline mr-2"
                                            >
                                                Görüntüle
                                            </button>
                                            <button
                                                onClick={() => handleFileAction(resource.pdfUrl.split('/').pop(), 'download')}
                                                className="hover:underline"
                                            >
                                                İndir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {search ? "Aramanızla eşleşen kaynak bulunamadı" : "Henüz kaynak eklenmemiş"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {uploadOpen && (
                <UploadResourceModal
                    onClose={() => setUploadOpen(false)}
                    onSuccess={() => {
                        fetchResources();
                        setUploadOpen(false);
                    }}
                />
            )}
        </div>
    );
}