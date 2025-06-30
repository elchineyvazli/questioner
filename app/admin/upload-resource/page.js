// app/admin/upload-resource/page.js
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UploadResourcePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [reliability, setReliability] = useState(100);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(false);

    const BADGE_OPTIONS = ['Peer Reviewed', 'AI Verified', 'Trusted', 'Academic', 'Hot', 'Trend'];

    if (!session || session.user.name !== 'admin') {
        return <div className="text-center mt-10 text-red-600">Bu sayfa yalnızca admin içindir.</div>;
    }

    const handleUpload = async () => {
        if (!file || !file.name.endsWith('.pdf') || !name.trim()) {
            alert('Lütfen geçerli bir PDF dosyası ve kaynak adı girin.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', name);
            formData.append('reliability', reliability);
            formData.append('badges', JSON.stringify(badges));

            const res = await fetch('/api/upload-resource', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Yükleme başarısız');

            alert('Kaynak başarıyla yüklendi!');
            router.push('/resources');
        } catch (err) {
            alert('Yükleme sırasında hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📤 Kaynak Yükle</h1>

            <input
                type="text"
                placeholder="Kaynak adı"
                className="w-full p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                type="file"
                accept="application/pdf"
                className="w-full p-2 border rounded"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <div>
                <label className="block text-sm font-medium">Güvenilirlik (%):</label>
                <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full p-2 border rounded"
                    value={reliability}
                    onChange={(e) => setReliability(Number(e.target.value))}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Rozetler:</label>
                <div className="flex flex-wrap gap-2">
                    {BADGE_OPTIONS.map(b => (
                        <button
                            key={b}
                            type="button"
                            className={`px-2 py-1 text-xs rounded border ${badges.includes(b) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                            onClick={() => {
                                setBadges(prev =>
                                    prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                                );
                            }}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? 'Yükleniyor...' : 'Yükle'}
            </button>
        </div>
    );
}
