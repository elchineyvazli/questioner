'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';

export default function AdminResourceEditModal({ resource, onClose, onResourceUpdated }) {
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef();

    useEffect(() => {
        if (resource) {
            setForm({
                ...resource,
                tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : '',
            });
            setError('');
        }
    }, [resource]);

    if (!resource) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleFileChange = (e) => {
        setForm(f => ({ ...f, file: e.target.files[0] || null }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('id', resource.id);
            formData.append('name', form.name);
            formData.append('reliability', Number(form.reliability));
            formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
            if (form.file) {
                formData.append('file', form.file);
            }
            const res = await fetch('/api/update-resource', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Kaydetme başarısız.');
            } else {
                onResourceUpdated(data.resource);
            }
        } catch {
            setError('Sunucu hatası.');
        }
        setSaving(false);
    };

    return (
        <Dialog open={!!resource} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
            <Dialog.Panel className="relative w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-700">
                <Dialog.Title className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
                    Kaynağı Düzenle
                </Dialog.Title>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Adı</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Güvenilirlik (%)</label>
                        <input
                            name="reliability"
                            type="number"
                            min={0}
                            max={100}
                            value={form.reliability}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Etiketler (virgülle ayır)</label>
                        <input
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="Bilimsel, Peer Reviewed, ..."
                            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">PDF Dosyasını Güncelle (opsiyonel)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="block w-full text-xs text-gray-600 dark:text-gray-400"
                        />
                        <div className="text-xs text-gray-400 mt-1">
                            {resource.fileUrl && (
                                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">Mevcut PDF’i Gör</a>
                            )}
                        </div>
                    </div>
                </div>
                {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-semibold"
                        disabled={saving}
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-70"
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </Dialog.Panel>
        </Dialog>
    );
}
