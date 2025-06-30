// app/components/ResourceTable.js
'use client';

import { useEffect, useState } from 'react';
import { FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function ResourceTable() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState('addedAt');
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

    useEffect(() => {
        fetch('/api/get-resources')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.resources)) {
                    setResources(data.resources);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const sortedResources = [...resources].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (sortKey === 'reliability') {
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (sortKey === 'addedAt') {
            return sortOrder === 'asc'
                ? new Date(aVal) - new Date(bVal)
                : new Date(bVal) - new Date(aVal);
        }
        return 0;
    });

    const toggleSort = (key) => {
        if (key === sortKey) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'addedAt'));
            if (sortOrder === 'addedAt') {
                setSortKey('addedAt');
                setSortOrder('desc');
            }
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const renderSortIcon = (key) => {
        if (key !== sortKey) return null;
        return sortOrder === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />;
    };

    if (loading) {
        return <div className="text-gray-500 text-sm">Yükleniyor...</div>;
    }

    return (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <table className="min-w-full text-sm text-left table-auto">
                <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold">
                    <tr>
                        <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('name')}>
                            Kaynak Adı
                        </th>
                        <th className="px-4 py-2">İndir</th>
                        <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('reliability')}>
                            Güvenilirlik {renderSortIcon('reliability')}
                        </th>
                        <th className="px-4 py-2">Etiketler</th>
                        <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('addedAt')}>
                            Eklenme {renderSortIcon('addedAt')}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {sortedResources.map((r, idx) => (
                        <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-zinc-800/50 transition">
                            <td className="px-4 py-2 text-gray-800 dark:text-white">{r.name}</td>
                            <td className="px-4 py-2">
                                {r.pdfUrl ? (
                                    <a
                                        href={`/api/proxy-pdf?url=${encodeURIComponent(r.pdfUrl)}&filename=${encodeURIComponent(r.name || "dosya")}.pdf`}
                                        className="inline-flex items-center text-blue-600 hover:underline"
                                        title="PDF indir"
                                    >
                                        <FiDownload className="mr-1" />
                                        İndir
                                    </a>
                                ) : (
                                    <span className="text-gray-300 cursor-not-allowed">
                                        <FiDownload />
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-200">{r.reliability}</td>
                            <td className="px-4 py-2 flex flex-wrap gap-1 items-center">
                                {/* Tag’ler */}
                                {r.tags?.map((tag) => (
                                    <span
                                        key={"tag-" + tag}
                                        className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-800 dark:text-yellow-100"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {/* Rozetler */}
                                {r.badges?.map((badge) => (
                                    <span
                                        key={"badge-" + badge}
                                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-800 dark:text-blue-100"
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                                {r.addedAt ? new Date(r.addedAt).toLocaleDateString() : ""}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
