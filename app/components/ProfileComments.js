'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ProfileComments({ nickname }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!nickname) return;

        fetch(`/api/get-user-comments?nick=${nickname}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setComments(data);
                } else {
                    setComments([]); // Güvenlik için boş dizi
                }
                setLoading(false);
            })
            .catch(() => {
                setComments([]);
                setLoading(false);
            });
    }, [nickname]);


    if (loading) {
        return <div className="text-sm text-gray-400 dark:text-gray-500">Yükleniyor...</div>;
    }

    if (comments.length === 0) {
        return (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Bu kullanıcı henüz hiç yorum yazmamış.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {comments.map((c) => (
                <div key={c.id} className="p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-700 dark:text-gray-200">{c.content}</p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(c.createdAt), { locale: tr, addSuffix: true })}
                    </div>
                    {c.badges?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {c.badges.map(b => (
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
