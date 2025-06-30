// lib/badgeMeta.js

// Burada tüm sistemde kullanılan rozet/etiketlerin meta bilgileri tutulur.
// Her bir etiketin: kısa adı, ikon, renk, açıklama (tooltip) gibi bilgileri burada merkezi olarak tutulur.

const BADGE_META = {
    "Bilimsel": {
        icon: "🧪",
        color: "bg-blue-200 text-blue-900 border-blue-400",
        description: "Bilimsel yöntemle hazırlanmış ve doğrulanmış kaynak."
    },
    "Peer Reviewed": {
        icon: "🔬",
        color: "bg-purple-200 text-purple-900 border-purple-400",
        description: "Akademik hakemli süreçten geçmiş güvenilir kaynak."
    },
    "Psikoloji": {
        icon: "🧠",
        color: "bg-yellow-200 text-yellow-900 border-yellow-400",
        description: "Psikoloji alanında kaynak."
    },
    // — Dilediğin kadar etiket ekleyebilirsin —
    "Felsefe": {
        icon: "💭",
        color: "bg-green-200 text-green-900 border-green-400",
        description: "Felsefe ile ilgili kaynak."
    },
    "Din": {
        icon: "🕌",
        color: "bg-pink-200 text-pink-900 border-pink-400",
        description: "Din ve inanç ile ilgili kaynak."
    },
    "AI": {
        icon: "🤖",
        color: "bg-pink-100 text-pink-800 border-pink-300",
        description: "Yapay zekâ ile işlenmiş/etiketlenmiş kaynak."
    },
    "Trend": {
        icon: "📈",
        color: "bg-indigo-100 text-indigo-900 border-indigo-400",
        description: "Gündemdeki önemli kaynak."
    },
    "Hot": {
        icon: "🔥",
        color: "bg-red-200 text-red-900 border-red-400",
        description: "Çok kısa sürede popüler olmuş kaynak."
    },
    // ... diğer etiketler ve rozetler buraya eklenir
};

export default BADGE_META;
