'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiDownload, FiInfo, FiUser, FiFileText } from 'react-icons/fi';
import Link from 'next/link';

export default function ResourceDetailPage() {
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiSummary, setAiSummary] = useState(null);
    const [similar, setSimilar] = useState([]);

    useEffect(() => {
        if (!id) return;
        fetch('/api/get-resources')
            .then(res => res.json())
            .then(data => {
                const found = data.resources?.find((r) => r.id === id);
                setResource(found || null);

                // Benzer kaynakları bul (aynı etiketlerden en fazla 5 tane)
                if (found) {
                    const sim = (data.resources || [])
                        .filter(x => x.id !== id && x.tags?.some(tag => found.tags?.includes(tag)))
                        .slice(0, 5);
                    setSimilar(sim);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    // AI özet özelliği (şimdilik statik, yakında API çağrısı ile)
    useEffect(() => {
        setAiSummary(null);
        // if (resource) {
        //     fetch('/api/summarize-resource', { method: "POST", body: JSON.stringify({ id: resource.id }) })
        //        .then(res => res.json())
        //        .then(data => setAiSummary(data.summary))
        // }
    }, [resource]);

    if (loading) {
        return <div className="text-center text-gray-500 py-10">Yükleniyor...</div>;
    }
    if (!resource) {
        return (
            <div className="text-center py-12 text-red-600 font-semibold">
                Böyle bir kaynak bulunamadı.<br />
                <Link href="/resources" className="text-blue-600 underline">Kaynaklara Geri Dön</Link>
            </div>
        );
    }

    // Güvenilirlik rengi
    let reliabilityColor = "bg-red-500";
    if (resource.reliability >= 85) reliabilityColor = "bg-green-500";
    else if (resource.reliability >= 60) reliabilityColor = "bg-yellow-400";

    // PDF kontrolü
    const isPdf = resource.fileUrl?.toLowerCase().endsWith('.pdf');

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
            <div className="flex items-center gap-3 mb-2">
                <FiInfo size={22} className="text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">{resource.name}</h1>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow space-y-4">
                {/* Ek Bilgiler */}
                <div className="flex flex-wrap gap-5 mb-1">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                        <FiFileText /> Eklenme: {resource.addedAt ? new Date(resource.addedAt).toLocaleDateString() : '—'}
                    </div>
                    {resource.uploader && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                            <FiUser /> Ekleyen: {resource.uploader}
                        </div>
                    )}
                </div>
                <div className="mb-2">
                    <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white ${isPdf ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 cursor-not-allowed'} rounded-lg`}
                        download={isPdf}
                        tabIndex={isPdf ? 0 : -1}
                    >
                        <FiDownload /> PDF İndir
                    </a>
                    {!isPdf && <span className="ml-3 text-xs text-red-500">PDF dosyası bulunamadı veya hatalı.</span>}
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Güvenilirlik:</div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded">
                        <div className={`h-2 ${reliabilityColor} rounded`} style={{ width: `${resource.reliability}%` }}></div>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{resource.reliability}%</div>
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Etiketler / Rozetler:</div>
                    <div className="flex flex-wrap gap-1">
                        {(resource.badges || resource.tags || []).map((b, i) => (
                            <span key={b + i} className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700">
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
                {/* AI Özeti */}
                <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">AI Özeti:</div>
                    {aiSummary
                        ? <div className="text-gray-700 dark:text-gray-100 text-sm">{aiSummary}</div>
                        : <div className="italic text-gray-400 dark:text-gray-500 text-sm">Bu özellik yakında aktif olacak. AI, PDF içeriğini tarayıp özet sunacak.</div>
                    }
                </div>
            </div>
            {/* Benzer Kaynaklar */}
            <div>
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Benzer Kaynaklar</h2>
                {similar.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {similar.map((sim) => (
                            <Link
                                href={`/resource/${sim.id || sim.fileUrl}`}
                                key={sim.id || sim.fileUrl}
                                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 hover:bg-blue-50 dark:hover:bg-zinc-800 flex flex-col transition"
                            >
                                <div className="font-semibold text-gray-800 dark:text-white mb-1">{sim.name}</div>
                                <div className="flex gap-1 flex-wrap mb-1">
                                    {(sim.badges || sim.tags || []).map((b, i) => (
                                        <span key={b + i} className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700">
                                            {b}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Eklenme: {sim.addedAt ? new Date(sim.addedAt).toLocaleDateString() : ""}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 dark:text-gray-500 italic">Uygun benzer kaynak bulunamadı.</div>
                )}
            </div>
        </div>
    );
}
