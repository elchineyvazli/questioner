'use client';

import { useEffect, useState, useRef } from 'react';
import { FiDownload, FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi';
import AdminResourceEditModal from '../components/AdminResourceEditModal';
import Link from 'next/link';

export default function AdminResourcesPanel() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editResource, setEditResource] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetch('/api/get-resources')
            .then(res => res.json())
            .then(data => setResources(data.resources || []))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Bu kaynağı silmek istediğine emin misin?')) return;
        setDeletingId(id);
        const res = await fetch('/api/delete-resource', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setResources((prev) => prev.filter(r => r.id !== id));
        }
        setDeletingId(null);
    };

    const handleEdit = (resource) => setEditResource(resource);

    const onResourceUpdated = (updated) => {
        setResources((prev) => prev.map(r => r.id === updated.id ? updated : r));
        setEditResource(null);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <UploadResourceForm onResourceAdded={resource => setResources(prev => [resource, ...prev])} />

            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Admin: Kaynak Yönetimi</h1>
            {loading ? (
                <div className="text-center py-8 text-gray-400 flex items-center justify-center gap-2">
                    <FiLoader className="animate-spin" /> Yükleniyor...
                </div>
            ) : (
                <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-7 text-xs font-semibold bg-gray-100 dark:bg-zinc-800 px-4 py-2">
                        <div className="col-span-2">Adı</div>
                        <div>PDF</div>
                        <div>Güvenilirlik</div>
                        <div>Etiketler</div>
                        <div>Eklenme</div>
                        <div></div>
                    </div>
                    {resources.map((r) => (
                        <div key={r.id} className="grid grid-cols-7 items-center px-4 py-2 border-t border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                            <div className="col-span-2 font-medium">{r.name}</div>
                            <div>
                                <Link href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 hover:underline">
                                    <FiDownload />
                                </Link>
                            </div>
                            <div>
                                <div className="h-2 bg-green-500 rounded" style={{ width: `${r.reliability}%` }}></div>
                                <div className="text-[10px] text-gray-500">{r.reliability}%</div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {(r.badges || r.tags || []).map((b, i) => (
                                    <span key={b + i} className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700">
                                        {b}
                                    </span>
                                ))}
                            </div>
                            <div className="text-xs text-gray-500">{r.addedAt ? new Date(r.addedAt).toLocaleDateString() : ""}</div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(r)} className="p-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700">
                                    <FiEdit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    disabled={deletingId === r.id}
                                    className="p-1 rounded bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                                >
                                    {deletingId === r.id ? <FiLoader className="animate-spin" /> : <FiTrash2 size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AdminResourceEditModal
                resource={editResource}
                onClose={() => setEditResource(null)}
                onResourceUpdated={onResourceUpdated}
            />
        </div>
    );
}

function UploadResourceForm({ onResourceAdded }) {
    const formRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = formRef.current;
        const formData = new FormData(form);

        const res = await fetch("/api/update-resource", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data.success) {
            alert("Yüklendi!");
            form.reset();
            onResourceAdded && onResourceAdded(data.resource);
        } else {
            alert(data.error || "Yükleme başarısız");
        }
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex gap-2 items-end mb-8 border p-4 rounded"
        >
            <div>
                <label className="block text-xs font-semibold mb-1">PDF Dosyası</label>
                <input name="file" type="file" accept="application/pdf" required className="block" />
            </div>
            <div>
                <label className="block text-xs font-semibold mb-1">Adı</label>
                <input name="name" required className="block border px-2 py-1 rounded" />
            </div>
            <div>
                <label className="block text-xs font-semibold mb-1">Güvenilirlik (%)</label>
                <input name="reliability" type="number" defaultValue={95} min={0} max={100} className="block border px-2 py-1 rounded" />
            </div>
            <div>
                <label className="block text-xs font-semibold mb-1">Etiketler (virgülle)</label>
                <input name="tags" placeholder="Landmark, Peer Reviewed, ..." className="block border px-2 py-1 rounded" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Yükle</button>
        </form>
    );
}