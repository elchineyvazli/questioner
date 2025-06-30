// app/api/mod-resource-comment/route.js

import { NextResponse } from "next/server";
import { metaClient } from "@/app/lib/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const META_BUCKET = process.env.R2_META_BUCKET;
const COMMENTS_JSON_KEY = "comments.json";

export async function POST(req) {
    try {
        const { commentId, action } = await req.json();
        if (!commentId || !["restore", "delete"].includes(action))
            return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

        // Yorumları oku
        let arr = [];
        try {
            const { Body } = await metaClient.send(new GetObjectCommand({
                Bucket: META_BUCKET,
                Key: COMMENTS_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            arr = JSON.parse(jsonStr);
            if (!Array.isArray(arr)) arr = [];
        } catch {
            arr = [];
        }

        const idx = arr.findIndex(c => c.id === commentId);
        if (idx === -1)
            return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });

        if (action === "delete") {
            // Yorumu tamamen sil
            arr.splice(idx, 1);
        } else if (action === "restore") {
            // Restore: Tüm raporları kaldır, yorum tekrar görünür olsun
            arr[idx].reports = [];
        }

        // Güncelle ve yaz
        await metaClient.send(new PutObjectCommand({
            Bucket: META_BUCKET,
            Key: COMMENTS_JSON_KEY,
            Body: Buffer.from(JSON.stringify(arr, null, 2)),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Mod comment hatası:", err);
        return NextResponse.json({ error: "İşlem yapılamadı." }, { status: 500 });
    }
}

// Yardımcı stream fonksiyonu
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
