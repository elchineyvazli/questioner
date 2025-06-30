// app/api/ai-search-resources/route.js

import { NextResponse } from "next/server";
import { getPdfFromR2 } from "@/app/lib/r2"; // Tüm json/vektör işlemlerinde BUNU KULLAN!
import { getEmbedding } from "@/app/lib/embedding";

const RESOURCES_JSON_KEY = "resources.json";
const VECTORS_JSON_KEY = "resource_vectors.json";

export async function POST(req) {
    try {
        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ results: [], error: "Sorgu zorunlu." }, { status: 400 });
        }

        // 1. Sorguyu embedle
        let qVec = null;
        try {
            qVec = await getEmbedding(query);
        } catch {
            qVec = null;
        }

        // 2. Vektörleri ve kaynakları oku (Pdf bucket'tan!)
        let vectors = [];
        let resources = [];
        try {
            vectors = JSON.parse(await getPdfFromR2(VECTORS_JSON_KEY)) || [];
        } catch { vectors = []; }
        try {
            resources = JSON.parse(await getPdfFromR2(RESOURCES_JSON_KEY)) || [];
        } catch { resources = []; }

        const minScore = 0.24;

        function cosineSim(a, b) {
            let dot = 0, normA = 0, normB = 0;
            for (let i = 0; i < a.length; i++) {
                dot += a[i] * b[i];
                normA += a[i] * a[i];
                normB += b[i] * b[i];
            }
            return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
        }

        // 3. AI ile benzer kaynakları bul
        let aiResults = [];
        if (qVec && vectors.length > 0) {
            aiResults = vectors.map(v => ({
                id: v.id,
                _score: cosineSim(qVec, v.embedding)
            }))
                .filter(v => v._score > minScore)
                .sort((a, b) => b._score - a._score)
                .slice(0, 20)
                .map(v => {
                    const r = resources.find(x => x.id === v.id);
                    return r ? { ...r, _score: v._score } : null;
                })
                .filter(Boolean);
        }

        // 4. Klasik kelime/string eşleşmesi
        const qLower = query.trim().toLowerCase();
        let keywordResults = resources.filter(r =>
            (r.name && r.name.toLowerCase().includes(qLower)) ||
            (r.title && r.title.toLowerCase().includes(qLower)) ||
            (r.description && r.description.toLowerCase().includes(qLower)) ||
            (Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(qLower)))
        ).map(r => ({ ...r, _score: 0.8 }));

        // 5. Sonuçları birleştir (tekrarsız)
        const seen = new Set();
        const finalResults = [];
        for (const item of [...aiResults, ...keywordResults]) {
            if (!item || seen.has(item.id)) continue;
            seen.add(item.id);
            finalResults.push(item);
        }

        return NextResponse.json({ results: finalResults }, { status: 200 });
    } catch (err) {
        console.error("AI Arama Hatası:", err);
        return NextResponse.json({ results: [], error: "Sunucu hatası." }, { status: 500 });
    }
}
