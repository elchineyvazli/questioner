'use client';

import { useEffect, useState } from 'react';
import QuestionCard from './QuestionCard';
import AnswerCard from './AnswerCard';

export default function ProfileAnswers({ nickname }) {
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!nickname) return;
        fetch(`/api/get-user-answers?nick=${encodeURIComponent(nickname)}`)
            .then(res => res.json())
            .then(data => {
                setAnswers(data.answers || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [nickname]);

    if (loading) return <div className="text-center mt-6 text-sm text-gray-500">Yükleniyor...</div>;
    if (answers.length === 0) return <div className="text-center mt-6 text-sm text-gray-400">Henüz cevap yok.</div>;

    return (
        <div className="space-y-6 mt-6">
            {answers.map((a) => (
                <AnswerCard key={a.id} answer={a} />
            ))}
        </div>
    );
}
