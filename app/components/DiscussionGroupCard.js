// app/components/DiscussionGroupCard.js
'use client';

import Link from 'next/link';
import { FiUsers, FiGlobe } from 'react-icons/fi';

export default function DiscussionGroupCard({ group }) {
    const router = useRouter();
    return (
        <Link href={`/discussions/${group.id}`}>
            <div
                className="p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-indigo-100 dark:border-indigo-800 hover:shadow-xl hover:scale-[1.02] transition cursor-pointer flex flex-col gap-2"
                onClick={() => router.push(`/discussions/${group.id}`)}
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-extrabold text-indigo-800 dark:text-indigo-200">{group.name}</span>
                    <span className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-100 text-xs flex items-center gap-1">
                        <FiGlobe className="inline mb-[1.5px]" />
                        {group.isPrivate ? 'Özel' : 'Herkese Açık'}
                    </span>
                </div>
                <div className="text-gray-700 dark:text-gray-200 text-sm mb-2">
                    {group.description || 'Açıklama yok.'}
                </div>
                <div className="flex items-center gap-3 mt-auto text-xs text-indigo-600 dark:text-indigo-200">
                    <span className="flex items-center gap-1">
                        <FiUsers /> {group.members.length} üye
                    </span>
                    <span className="ml-auto text-gray-400">
                        {group.created_at ? new Date(group.created_at).toLocaleDateString() : ''}
                    </span>
                </div>
            </div>
        </Link>
    );
}
