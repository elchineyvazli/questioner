// app/api/mod-resource/route.js

import { NextResponse } from "next/server";
import { pdfClient } from "@/app/lib/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const PDF_BUCKET = process.env.R2_PDF_BUCKET;
const RESOURCES_JSON_KEY = "resources.json";

export async function POST(req) {
    try {
        const { resourceId, action } = await req.json();

        if (!resourceId || !["approve", "delete"].includes(action)) {
            return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
        }

        // 1. resources.json'u indir
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
            return NextResponse.json({ error: "Kaynak listesi yok." }, { status: 500 });
        }

        // 2. Kaynağı bul (index ile!)
        const idx = resourcesArr.findIndex(r => r.id === resourceId);
        if (idx === -1) return NextResponse.json({ error: "Kaynak bulunamadı." }, { status: 404 });

        if (action === "approve") {
            // Sadece flagged/pending ise approve yap
            resourcesArr[idx].status = "approved";
        } else if (action === "delete") {
            // Tamamen sil
            resourcesArr.splice(idx, 1);
        }

        // 3. JSON'u kaydet
        const jsonBody = JSON.stringify(resourcesArr, null, 2);
        await pdfClient.send(new PutObjectCommand({
            Bucket: PDF_BUCKET,
            Key: RESOURCES_JSON_KEY,
            Body: Buffer.from(jsonBody),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err) {
        console.error("Mod aksiyonu hatası:", err);
        return NextResponse.json({ error: "İşlem yapılamadı." }, { status: 500 });
    }
}

// Cloudflare stream => string çevirici
async function streamToString(stream) {
    if (stream instanceof Buffer) {
        return stream.toString();
    }
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
