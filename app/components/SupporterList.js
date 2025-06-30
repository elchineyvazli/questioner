"use client";
import { useEffect, useState } from "react";

// Sadece public okuma için api route kullanmak istiyorsan "/api/supporters" ekle (güvenli)
// Ama şimdilik doğrudan public dosyadan fetch edeceğiz
const SUPPORTERS_JSON = "/app/scripts/supporters.json";

export default function SupporterList({ limit = 10 }) {
    const [supporters, setSupporters] = useState([]);

    useEffect(() => {
        fetch(SUPPORTERS_JSON)
            .then(res => res.json())
            .then(data => setSupporters(Array.isArray(data) ? data.slice(0, limit) : []))
            .catch(() => setSupporters([]));
    }, [limit]);

    if (!supporters.length) {
        return (
            <div className="text-sm text-gray-400 mt-8 text-center">
                Henüz destekçi yok. İlk destek verenlerden biri olabilirsin!
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mt-10">
            <div className="font-bold text-lg text-center mb-2 text-yellow-700 dark:text-yellow-300">
                Son Destekçiler 💛
            </div>
            <div className="rounded-xl shadow bg-white dark:bg-zinc-800 border border-yellow-100 dark:border-zinc-700">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr>
                            <th className="px-3 py-2">Ad</th>
                            <th className="px-3 py-2">Mesaj</th>
                            <th className="px-3 py-2">Miktar</th>
                            <th className="px-3 py-2">Tarih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {supporters.map((sup, i) => (
                            <tr key={i} className="border-t border-yellow-50 dark:border-zinc-700">
                                <td className="px-3 py-2 font-semibold">
                                    {sup.nickname || "Anonim"}
                                </td>
                                <td className="px-3 py-2 max-w-[160px] truncate" title={sup.message}>
                                    {sup.message || <span className="text-gray-400">–</span>}
                                </td>
                                <td className="px-3 py-2 text-yellow-600 font-bold">
                                    ${sup.amount}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                    {new Date(sup.createdAt).toLocaleDateString("tr-TR")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
