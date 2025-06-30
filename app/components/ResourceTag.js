// app/components/ResourceTag.js
'use client';

const TAG_META = {
    "Landmark": { icon: "⭐", color: "bg-yellow-300 text-yellow-900", type: "round", desc: "Çığır açan otorite kaynak." },
    "Peer Reviewed": { icon: "🧪", color: "bg-violet-400 text-white", type: "square", desc: "Hakemli bilimsel eser." },
    "Primary Source": { icon: "📄", color: "bg-pink-300 text-pink-900", type: "square", desc: "Birincil orijinal kaynak." },
    "Curated": { icon: "👑", color: "bg-green-300 text-green-900", type: "round", desc: "Toplulukça seçilen en iyi kaynak." },
    "Cited": { icon: "🔗", color: "bg-blue-300 text-blue-900", type: "round", desc: "Çok sayıda cevapta referans." },
    "Fresh": { icon: "🆕", color: "bg-lime-200 text-lime-900", type: "square", desc: "Son 2 yıl içinde yayımlanmış." },
    "Comprehensive": { icon: "📚", color: "bg-amber-200 text-amber-900", type: "square", desc: "Detaylı ve derinlemesine içerik." },
    "Controversial": { icon: "⚡", color: "bg-orange-300 text-orange-900", type: "round", desc: "Çelişkili/tartışmalı kaynak." },
    "Open Access": { icon: "🔓", color: "bg-cyan-200 text-cyan-900", type: "square", desc: "Açık erişim." },
    "Verified": { icon: "✅", color: "bg-emerald-300 text-emerald-900", type: "round", desc: "AI+insan onaylı güvenilir kaynak." },
};

export default function ResourceTag({ tag }) {
    const meta = TAG_META[tag] || {
        icon: "❓", color: "bg-gray-200 text-gray-500", type: "square", desc: "Açıklama yok."
    };
    return (
        <abbr
            title={meta.desc}
            className={`
                ${meta.type === "round" ? "rounded-full" : "rounded-md"}
                inline-flex items-center justify-center w-7 h-7 font-bold text-lg
                shadow-sm mr-1 select-none
                ${meta.color}
                resource-glow
                cursor-pointer
                transition
                hover:scale-110
            `}
            style={{
                animation: "resource-glow 2.2s infinite alternate",
                borderWidth: 2,
                borderColor: "#e0e7ff"
            }}
        >
            <span className="">{meta.icon}</span>
        </abbr>
    );
}
