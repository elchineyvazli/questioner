// app/lib/badgeUtils.js

export function calculateBadges({ nickname, allAnswers = [], allResources = [], supporters = [] }) {
    const badges = new Set();

    const userAnswers = allAnswers.filter(a => a.nickname === nickname);
    const totalVotes = userAnswers.reduce((sum, a) => sum + (a.votes || 0), 0);
    const highRatedAnswers = userAnswers.filter(a => (a.votes || 0) >= 3);

    const userResources = allResources.filter(r => r.nickname === nickname);

    // 🎖️ Uzman: 5 cevap + her biri en az 3 oy
    if (userAnswers.length >= 5 && highRatedAnswers.length >= 5) {
        badges.add('uzman');
    }

    // 🌟 Destekçi: 3'ten fazla kaynak eklemiş
    if (userResources.length >= 3) {
        badges.add('destekçi');
    }

    // 🧠 Popüler: toplam oy sayısı >= 10
    if (totalVotes >= 10) {
        badges.add('popüler');
    }

    // 💛 Haftanın Destekçisi: Son 7 gün içinde bağış yapan
    const now = Date.now();
    const last7Days = supporters.filter(sup =>
        sup.nickname === nickname &&
        Date.parse(sup.createdAt) > now - 7 * 24 * 60 * 60 * 1000
    );
    if (last7Days.length > 0) {
        badges.add('haftanin_destekcisi');
    }

    return Array.from(badges);
}

export function calculateBadgesForUser(nickname, answers = [], resources = [], supporters = []) {
    return calculateBadges({ nickname, allAnswers: answers, allResources: resources, supporters });
}
