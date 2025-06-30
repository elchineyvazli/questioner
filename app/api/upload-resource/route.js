import { NextResponse } from "next/server";
import { pdfClient, uploadPDFToR2 } from "@/app/lib/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { analyzeResourceWithAI } from "@/app/lib/aiUtils";
import pdfParse from "pdf-parse/lib/pdf-parse.js"; // Doğrudan core modül import

const RESOURCES_JSON_KEY = "resources.json";
const PDF_BUCKET = process.env.R2_PDF_BUCKET;

function sanitizeFileName(name) {
    return name?.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now() + ".pdf";
}

function extractPdfText(fullText) {
    const words = fullText.trim().split(/\s+/);
    if (words.length < 2000) return null;

    const first300 = words.slice(0, 300).join(" ");
    const middleStart = Math.floor(words.length / 2) - 200;
    const middle400 = words.slice(middleStart, middleStart + 400).join(" ");
    const last300 = words.slice(-300).join(" ");
    return `${first300} ... ${middle400} ... ${last300}`;
}

export const config = {
    api: {
        bodyParser: false
    }
};

export async function POST(req) {
    console.log('Gelen Headers:', {
        'content-type': req.headers.get('content-type'),
        'content-length': req.headers.get('content-length')
    });

    try {
        const formData = await req.formData();
        console.log("Alınan FormData:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof Blob ?
                `Blob (${value.size} bytes)` : value);
        }

        const file = formData.get("file");
        if (!file) {
            return NextResponse.json(
                { error: "Dosya alınamadı" },
                { status: 400 }
            );
        }
        console.log("GELEN DOSYA:", file);

        let name = formData.get("name");
        const reliability = parseInt(formData.get("reliability") || "0", 10);
        const tags = JSON.parse(formData.get("tags") || "[]");

        if (!file || !file.name.endsWith(".pdf")) {
            return NextResponse.json({ error: "PDF dosyası gerekli." }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // PDF'ten metin çıkar (DÜZELTİLMİŞ KISIM)
        const parsed = await pdfParse(fileBuffer); // .default KULLANMIYORUZ
        const fullText = parsed.text || "";
        const wordCount = fullText.trim().split(/\s+/).length;

        if (wordCount < 2000) {
            return NextResponse.json({ error: "PDF içeriği en az 2000 kelime olmalıdır." }, { status: 400 });
        }

        const pdfText = extractPdfText(fullText);

        // AI analiz yap
        const aiResult = await analyzeResourceWithAI({ text: pdfText });
        const aiTags = aiResult?.tags || [];
        const aiSummary = aiResult?.summary || "";
        const abuse = aiResult?.abuse;

        if (abuse) {
            return NextResponse.json({ error: "Yüklenen içerik uygun değil (spam, boş veya hatalı)." }, { status: 400 });
        }

        if (!name || name.trim().length < 5) {
            name = aiSummary?.slice(0, 80) || "Kaynak";
        }

        const filename = sanitizeFileName(name);
        const pdfUrl = await uploadPDFToR2({
            fileBuffer,
            filename,
            mimetype: file.type,
        });

        // resources.json'u oku
        let resourcesArr = [];
        try {
            const { Body } = await pdfClient.send(new GetObjectCommand({
                Bucket: PDF_BUCKET,
                Key: RESOURCES_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            resourcesArr = JSON.parse(jsonStr);
            if (!Array.isArray(resourcesArr)) resourcesArr = [];
        } catch {
            resourcesArr = [];
        }

        const newResource = {
            id: crypto.randomUUID(),
            name,
            reliability,
            tags,
            pdfUrl,
            pdfText,
            aiSummary,
            badges: aiTags.includes("Verified") || aiTags.includes("Landmark") ? ["AI tarafından onaylandı"] : [],
            addedAt: new Date().toISOString(),
        };

        resourcesArr.push(newResource);

        await pdfClient.send(new PutObjectCommand({
            Bucket: PDF_BUCKET,
            Key: RESOURCES_JSON_KEY,
            Body: Buffer.from(JSON.stringify(resourcesArr, null, 2)),
            ContentType: "application/json",
        }));

        return NextResponse.json({ success: true, resource: newResource }, { status: 200 });

    } catch (err) {
        console.error("UploadResource ERROR:", err);
        return NextResponse.json({ error: "Yükleme sırasında bir hata oluştu." }, { status: 500 });
    }
}

async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}