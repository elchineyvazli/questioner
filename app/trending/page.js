// app/trending/page.js
'use client';

import { useEffect, useState } from 'react';
import AnswerCard from '../components/AnswerCard';

export default function TrendingPage() {
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/trending-answers')
            .then(res => res.json())
            .then(data => {
                setAnswers(data.trending || []);
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-3xl mx-auto mt-20 px-4">
            <h1 className="text-2xl font-bold mb-4 text-orange-600">📈 Yükselen Cevaplar</h1>
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <span className="animate-spin mr-2">⏳</span>Yükleniyor...
                </div>
            ) : answers.length === 0 ? (
                <div>Şu anda yükselen cevap yok.</div>
            ) : (
                <div className="space-y-4">
                    {answers.map((answer) => (
                        <AnswerCard key={answer.id} answer={answer} />
                    ))}
                </div>
            )}
        </div>
    );
}