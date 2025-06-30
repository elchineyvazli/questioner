'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QuestionCard from '@/app/components/QuestionCard';
import QuestionDetailModal from '@/app/components/QuestionDetailModal'; // ekledik

export default function TagPage() {
    const { slug } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null); // modal için

    useEffect(() => {
        if (!slug) return;
        fetch(`/api/get-questions-by-tag?tag=${slug}`)
            .then(res => res.json())
            .then(data => {
                setQuestions(data.questions || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return <div className="text-center mt-10">Yükleniyor...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-orange-600 mb-6">#{slug} etiketiyle ilgili sorular</h1>
            {questions.length === 0 ? (
                <div className="text-gray-500">Bu etiketle ilgili henüz soru yok.</div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            onComment={(id) => setSelectedId(id)} // 💡 Detay butonunu çalıştırır
                        />
                    ))}
                </div>
            )}
            {/* Detay Modalı */}
            <QuestionDetailModal
                open={!!selectedId}
                questionId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </div>
    );
}
