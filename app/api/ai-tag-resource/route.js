// app/api/ai-tag-resource/route.js

import { NextResponse } from "next/server";
import { analyzeResourceWithAI } from "@/app/lib/aiUtils";
import { getPdfFromR2, uploadPdfToR2 } from "@/app/lib/r2";
import { PDFDocument } from "pdf-lib";

const RESOURCES_JSON_KEY = "resources.json";

export async function POST(req) {
    try {
        const { resourceId } = await req.json();
        if (!resourceId)
            return NextResponse.json({ error: "Eksik veri." }, { status: 400 });

        let resourcesArr = [];
        try {
            resourcesArr = JSON.parse(await getPdfFromR2(RESOURCES_JSON_KEY)) || [];
        } catch { resourcesArr = []; }
        const idx = resourcesArr.findIndex(r => r.id === resourceId);
        if (idx === -1)
            return NextResponse.json({ error: "Kaynak bulunamadı." }, { status: 404 });

        const resource = resourcesArr[idx];

        // --- PDF metni çıkar ---
        let inputText = "";
        if (resource.pdfUrl) {
            inputText = await extractTextFromPDF(resource.pdfUrl);
        } else if (resource.url) {
            inputText = resource.description + " " + resource.url;
        } else {
            inputText = resource.description || "";
        }

        // AI ile analiz et
        const aiResult = await analyzeResourceWithAI({ text: inputText });

        // Sonucu kaynağa işle
        resource.tags = aiResult.tags || [];
        resource.aiSummary = aiResult.summary || "";
        resource.abuse = aiResult.abuse || false;
        resource.reviewLog = resource.reviewLog || [];
        resource.reviewLog.push({
            by: "ai",
            date: new Date().toISOString(),
            result: aiResult
        });

        resourcesArr[idx] = resource;
        await uploadPdfToR2({
            key: RESOURCES_JSON_KEY,
            body: resourcesArr,
            contentType: "application/json"
        });

        return NextResponse.json({ success: true, aiResult }, { status: 200 });
    } catch (err) {
        console.error("AI tagging hatası:", err);
        return NextResponse.json({ error: "AI tagging başarısız." }, { status: 500 });
    }
}

// PDF'den metin çıkarma fonksiyonu (pdf-lib kullanarak)
async function extractTextFromPDF(pdfUrl) {
    try {
        // PDF'i indir
        const res = await fetch(pdfUrl);
        if (!res.ok) return "";
        const arrayBuffer = await res.arrayBuffer();

        // PDF'i yükle
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        let text = "";

        // Her sayfadaki metni çıkar
        for (let i = 0; i < Math.min(pdfDoc.getPageCount(), 5); i++) {
            const page = pdfDoc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
        }

        return text.slice(0, 6000);
    } catch (err) {
        console.error("PDF parse hatası:", err);
        return "";
    }
}