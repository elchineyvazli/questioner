'use client';

import { useState } from 'react';

export default function AdminResourceUploadPage() {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [reliability, setReliability] = useState(80);
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);

        if (!file || !file.name.endsWith('.pdf')) {
            setError("Sadece PDF dosyası yükleyebilirsiniz.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
        formData.append("reliability", reliability);
        formData.append("tags", JSON.stringify(tags.split(',').map(t => t.trim()).filter(t => t)));

        try {
            const res = await fetch('/api/upload-resource', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Yükleme başarısız.');
            }

            setSuccess("Kaynak başarıyla yüklendi.");
            setName('');
            setFile(null);
            setReliability(80);
            setTags('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">📤 Kaynak Yükle (Admin)</h1>

            {success && <div className="mb-4 text-sm text-green-700 bg-green-100 px-4 py-2 rounded">{success}</div>}
            {error && <div className="mb-4 text-sm text-red-700 bg-red-100 px-4 py-2 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kaynak Adı</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded border dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF Dosyası</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full mt-1 text-sm text-gray-600 dark:text-gray-300"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Güvenilirlik (0–100)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={reliability}
                        onChange={(e) => setReliability(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 rounded border dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Etiketler (virgülle ayır)</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="örn: Bilimsel, Peer Reviewed, Felsefe"
                        className="w-full mt-1 px-3 py-2 rounded border dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-500 rounded shadow hover:scale-105 transition"
                >
                    {loading ? 'Yükleniyor...' : 'Yükle'}
                </button>
            </form>
        </div>
    );
}
