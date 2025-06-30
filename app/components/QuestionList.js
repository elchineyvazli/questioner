'use client';

import { useState } from 'react';
import QuestionCard from './QuestionCard';
import QuestionDetailModal from './QuestionDetailModal'; // <--- Modalı içeri al

function SectionHeader({ icon, title, subtitle }) {
    return (
        <div className="md:sticky md:top-0 z-10 bg-white/80 dark:bg-[#151b22]/80 backdrop-blur border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
                <span>{icon}</span> {title}
            </h2>
            {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
    );
}

function EmptyState({ icon = '🤔', title = 'Hiç soru yok.', subtitle = 'İlk sorunu paylaş!' }) {
    return (
        <div className="col-span-full flex flex-col items-center py-10 text-gray-400">
            <span className="text-2xl mb-1">{icon}</span>
            <span className="font-semibold text-gray-600 dark:text-gray-300">{title}</span>
            {subtitle && <span className="text-sm mt-1">{subtitle}</span>}
        </div>
    );
}

export default function QuestionList({ questions = [], loading, onComment }) {
    const [selectedId, setSelectedId] = useState(null);

    const handleComment = (id) => {
        setSelectedId(id);
    };

    const closeModal = () => {
        setSelectedId(null);
    };

    if (!loading && (!questions || questions.length === 0)) {
        return <EmptyState title="Henüz soru eklenmemiş." subtitle="İlk sorunu sor ve tartışmayı başlat!" />;
    }


    return (
        <div className="w-full flex flex-col gap-12">
            {questions.length === 0 ? (
                <div className="text-center text-gray-500 py-12">Henüz soru yok.</div>
            ) : (
                questions.map((q) => (
                    <QuestionCard key={q.id} question={q} onComment={handleComment} />
                ))
            )}

            {/* MODAL burada çağrılır */}
            <QuestionDetailModal
                questionId={selectedId}
                open={!!selectedId}
                onClose={closeModal}
            />
        </div>
    );
}
