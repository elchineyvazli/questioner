'use client';

import { useEffect, useState } from 'react';
import BadgeUpdater from '../components/BadgeUpdater';

export default function AdminPanel() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [tab, setTab] = useState('questions');
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const nick = localStorage.getItem('nickname');
        if (nick === 'admin') {
            setIsAdmin(true);
        }
    }, []);

    useEffect(() => {
        if (tab === 'reports') {
            fetch('/api/get-reports')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setReports(data);
                })
                .catch(err => console.error('Rapor çekme hatası:', err));
        }
    }, [tab]);

    if (!isAdmin) {
        return (
            <div className="max-w-xl mx-auto text-center mt-20 text-red-600 font-bold">
                Bu sayfaya sadece yöneticiler erişebilir.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-20 px-4">
            <h1 className="text-2xl font-extrabold mb-6 text-orange-600">Admin Paneli</h1>

            {/* Sekmeler */}
            <div className="flex gap-4 mb-6 flex-wrap">
                {["questions", "answers", "comments", "reports", "badges"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === t
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white'
                            }`}
                    >
                        {t === 'questions' ? 'Sorular'
                            : t === 'answers' ? 'Cevaplar'
                                : t === 'comments' ? 'Yorumlar'
                                    : 'Raporlar'}
                    </button>
                ))}
            </div>

            {/* İçerik Alanı */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow space-y-2 text-sm">
                {tab === 'questions' && <div>📌 Soru yönetimi yakında entegre edilecek.</div>}
                {tab === 'answers' && <div>🧠 Cevap yönetimi yakında entegre edilecek.</div>}
                {tab === 'comments' && <div>💬 Yorum yönetimi yakında entegre edilecek.</div>}
                {tab === 'reports' && (
                    <div>
                        <h2 className="text-lg font-bold mb-3 text-orange-500">🚨 Raporlar</h2>
                        <div className="space-y-2">
                            {reports.length === 0 && <p className="text-gray-400">Hiç rapor bulunamadı.</p>}
                            {reports.map(r => (
                                <div key={r.id} className="p-3 rounded border bg-gray-50 dark:bg-zinc-900">
                                    <div className="text-xs text-gray-600 dark:text-gray-300">ID: <span className="font-mono">{r.id}</span></div>
                                    <div className="text-sm">📝 <span className="font-bold">{r.reason}</span> — <span className="text-gray-600">{r.question_id || r.answer_id || r.comment_id}</span></div>
                                    <div className="text-[10px] text-gray-400">{new Date(r.reported_at).toLocaleString('tr-TR')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'badges' && (
                    <div>
                        <h2 className="text-lg font-bold mb-4 text-orange-500">🎖️ Rozet Güncelleme</h2>
                        <BadgeUpdater />
                    </div>
                )}

            </div>
        </div>
    );
}
