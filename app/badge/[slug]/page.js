'use client';

import { useParams } from 'next/navigation';
import { FiAward } from 'react-icons/fi';
import Link from 'next/link';

const BADGES = [
    {
        slug: 'hot',
        name: '🔥 Hot',
        description: 'Kısa sürede çokça oy alan ve yorumlanan sorulara verilir.',
        category: 'Trend Rozetleri',
        color: 'bg-red-500 text-white',
    },
    {
        slug: 'trend',
        name: '📈 Trend',
        description: 'Bugünün topluluk gündeminde öne çıkan sorulara verilir.',
        category: 'Trend Rozetleri',
        color: 'bg-indigo-500 text-white',
    },
    {
        slug: 'ai',
        name: '🤖 AI',
        description: 'AI tarafından anlamlı, güçlü veya özgün bulunan cevaplara verilir.',
        category: 'Yapay Zekâ & Kalite',
        color: 'bg-pink-500 text-white',
    },
    {
        slug: 'verified',
        name: '🔗 Doğrulanmış',
        description: 'Akademik veya güvenilir kaynak içeren içeriklere verilir.',
        category: 'Kaynak Rozeti',
        color: 'bg-blue-500 text-white',
    },
];

export default function BadgeDetailPage() {
    const { slug } = useParams();
    const badge = BADGES.find(b => b.slug === slug);

    if (!badge) {
        return (
            <div className="max-w-xl mx-auto p-6 text-center text-red-600 font-semibold">
                Böyle bir rozet bulunamadı.
                <br />
                <Link href="/" className="text-blue-600 underline mt-2 inline-block">Anasayfaya Dön</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
            <div className="flex items-center gap-3">
                <FiAward size={28} className="text-yellow-500" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{badge.name} Rozeti</h1>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow">
                <div className="text-sm text-indigo-600 dark:text-indigo-300 font-semibold mb-1">{badge.category}</div>
                <div className="text-lg text-gray-700 dark:text-gray-200">{badge.description}</div>

                <div className="mt-6">
                    <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Nasıl kazanılır?</h2>
                    <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                        <li>İçeriklerin kaliteli, özgün veya topluluk tarafından beğeniliyor olması gerekir.</li>
                        <li>Her rozet sistem tarafından otomatik olarak değerlendirilir.</li>
                        <li>Moderatörler de bazı rozetleri manuel olarak verebilir.</li>
                    </ul>
                </div>
            </div>

            <Link href="/profile" className="text-blue-600 underline text-sm">Profiline geri dön</Link>
        </div>
    );
}
