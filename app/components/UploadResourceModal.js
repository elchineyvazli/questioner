'use client';

import { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';

export default function UploadResourceModal({ onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [reliability, setReliability] = useState(80);
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!file || !file.name.endsWith('.pdf')) {
            setError("Lütfen geçerli bir PDF dosyası seçin.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
        formData.append("reliability", reliability);
        formData.append("tags", JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));

        try {
            const res = await fetch('/api/upload-resource', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Yükleme başarısız.");

            setSuccess("Kaynak başarıyla yüklendi!");
            onSuccess?.(); // Sayfayı yenilemek için
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-lg p-6 relative shadow-xl border border-gray-200 dark:border-zinc-700">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition">
                    <FiX size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiUpload />
                    Yeni Kaynak Yükle
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kaynak Adı</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full mt-1 px-3 py-2 rounded border dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF Dosyası</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                            className="w-full mt-1 text-sm text-gray-600 dark:text-gray-300"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Güvenilirlik (0–100)</label>
                        <input
                            type="number"
                            value={reliability}
                            onChange={(e) => setReliability(Number(e.target.value))}
                            min={0}
                            max={100}
                            required
                            className="w-full mt-1 px-3 py-2 rounded border dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Etiketler (virgülle ayır)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="örn: bilim, felsefe, peer-reviewed"
                            className="w-full mt-1 px-3 py-2 rounded border dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-sm text-gray-800 dark:text-white"
                        />
                    </div>

                    {error && <div className="text-sm text-red-600">{error}</div>}
                    {success && <div className="text-sm text-green-600">{success}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-500 rounded shadow hover:scale-105 transition"
                    >
                        {loading ? "Yükleniyor..." : "Yükle"}
                    </button>
                </form>
            </div>
        </div>
    );
}
