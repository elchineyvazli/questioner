// app/discussions/page.js
'use client';

import { useState } from 'react';
import DiscussionGroupList from '../components/DiscussionGroupList';
import DiscussionTrends from '../components/DiscussionTrends';
import CuriousCorner from '../components/CuriousCorner';
import NewGroupModal from '../components/NewGroupModal';
import StartChannelModal from '../components/StartChannelModal';
import LiveDiscussions from '../components/LiveDiscussions';
import WeeklyChallenge from '../components/WeeklyChallenge';
import InviteBanner from '../components/InviteBanner';
import DiscussionAnimations from '../components/DiscussionAnimations';

export default function DiscussionsPage() {
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [showStartChannel, setShowStartChannel] = useState(false);
    const [refresh, setRefresh] = useState(0);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8 relative">

            <DiscussionAnimations />

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                <button
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow transition"
                    onClick={() => setShowNewGroup(true)}
                >
                    + Grup Kur
                </button>
                <button
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow transition"
                    onClick={() => setShowStartChannel(true)}
                >
                    + Kanal Aç
                </button>
                <InviteBanner />
            </div>

            <LiveDiscussions />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CuriousCorner />
                <DiscussionTrends />
            </div>

            <WeeklyChallenge />

            <div className="mt-8">
                <h2 className="text-2xl font-extrabold text-indigo-800 dark:text-indigo-200 mb-4">
                    Aktif Tartışma Grupları
                </h2>
                <DiscussionGroupList />
            </div>

            <NewGroupModal
                open={showNewGroup}
                onClose={() => setShowNewGroup(false)}
                onCreated={() => setRefresh(r => r + 1)}
            />
            <StartChannelModal open={showStartChannel} onClose={() => setShowStartChannel(false)} />
        </div>
    );
}
