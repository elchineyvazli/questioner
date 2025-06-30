// app/api/delete-resource/route.js

import { NextResponse } from "next/server";
import { pdfClient, pdfClient } from "@/app/lib/r2";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_PDF_BUCKET = process.env.R2_PDF_BUCKET;
const RESOURCES_JSON_KEY = "resources.json";

export async function POST(req) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "ID zorunlu." }, { status: 400 });
        }

        // Mevcut kaynakları çek
        let resourcesArr = [];
        try {
            const { Body } = await pdfClient.send(new GetObjectCommand({
                Bucket: R2_PDF_BUCKET,
                Key: RESOURCES_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            resourcesArr = JSON.parse(jsonStr);
            if (!Array.isArray(resourcesArr)) resourcesArr = [];
        } catch (e) {
            resourcesArr = [];
        }

        // Silinecek kaynağı bul
        const idx = resourcesArr.findIndex(r => r.id === id);
        if (idx === -1) {
            return NextResponse.json({ error: "Kaynak bulunamadı." }, { status: 404 });
        }
        const toDelete = resourcesArr[idx];

        // PDF dosyasını sil (varsa)
        let pdfUrl = toDelete.pdfUrl || toDelete.fileUrl || null;
        if (pdfUrl) {
            // Sadece dosya adını ayıkla (bucket'tan tam key)
            const filename = pdfUrl.split("/").pop();
            try {
                await pdfClient.send(new DeleteObjectCommand({
                    Bucket: R2_PDF_BUCKET,
                    Key: filename,
                }));
            } catch (e) {
                // Zaten silinmiş olabilir, hata verme
            }
        }

        // Listeden çıkar
        resourcesArr.splice(idx, 1);

        // Kaydet (pdf bucket)
        await pdfClient.send(new PutObjectCommand({
            Bucket: R2_PDF_BUCKET,
            Key: RESOURCES_JSON_KEY,
            Body: JSON.stringify(resourcesArr, null, 2),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err) {
        console.error("DeleteResource Hatası:", err);
        return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
    }
}

// Stream to string util
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
