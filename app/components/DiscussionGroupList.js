// app/components/DiscussionGroupList.js
'use client';

import { useEffect, useState } from "react";
import DiscussionGroupCard from "./DiscussionGroupCard";

export default function DiscussionGroupList({ onSelect }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        fetch("/api/get-groups")
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                setGroups(Array.isArray(data.groups) ? data.groups : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        return () => { isMounted = false };
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Yükleniyor...
            </div>
        );
    }

    if (!groups.length) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Henüz hiç grup yok. İlk grubu sen oluştur!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
                <DiscussionGroupCard
                    key={group.id}
                    group={group}
                    onClick={() => onSelect?.(group)}
                />
            ))}
        </div>
    );
}
