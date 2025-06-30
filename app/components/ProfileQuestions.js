'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ProfileQuestions({ nickname }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!nickname) return;

        fetch(`/api/get-user-questions?nick=${nickname}`)
            .then(res => res.json())
            .then(data => {
                setQuestions(Array.isArray(data.questions) ? data.questions : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [nickname]);

    if (loading) {
        return <div className="text-sm text-gray-400 dark:text-gray-500">Yükleniyor...</div>;
    }

    if (questions.length === 0) {
        return (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Bu kullanıcı henüz hiç soru sormamış.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {questions.map((q) => (
                <div key={q.id} className="p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{q.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{q.content}</p>
                    <div className="mt-2 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(q.createdAt), { locale: tr, addSuffix: true })}
                    </div>
                    {q.badges?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {q.badges.map(b => (
                                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700">
                                    {b}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
