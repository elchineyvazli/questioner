// app/api/report-resource-comment/route.js

import { NextResponse } from "next/server";
import { r2Client } from "../../../app/lib/r2";
import { hashIp } from "../../../app/lib/ipHash";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.R2_PDF_BUCKET;
const COMMENTS_JSON_KEY = "comments.json";

export async function POST(req) {
    try {
        const { commentId, reason } = await req.json() || {};
        if (!commentId || typeof reason !== "string" || reason.length < 2)
            return NextResponse.json({ error: "Eksik veya geçersiz veri." }, { status: 400 });

        // Gerçek IP hash'le
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-real-ip") ||
            "0.0.0.0";
        const userHash = await hashIp(ip);

        // Yorumları oku
        let arr = [];
        try {
            const { Body } = await r2Client.send(new GetObjectCommand({
                Bucket: R2_BUCKET,
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

        arr[idx].reports = Array.isArray(arr[idx].reports) ? arr[idx].reports : [];
        // Aynı hash tekrar aynı yorumu raporlayamaz
        if (arr[idx].reports.some(r => r.by === userHash))
            return NextResponse.json({ error: "Bu yorumu zaten raporladınız." }, { status: 409 });

        arr[idx].reports.push({
            by: userHash,
            reason: reason.slice(0, 300),
            date: new Date().toISOString(),
        });

        // JSON'u güncelle ve kaydet
        await r2Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: COMMENTS_JSON_KEY,
            Body: Buffer.from(JSON.stringify(arr, null, 2)),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json({ success: true, reports: arr[idx].reports.length }, { status: 200 });
    } catch (err) {
        console.error("Yorum rapor hatası:", err);
        return NextResponse.json({ error: "Yorum raporlanamadı." }, { status: 500 });
    }
}

// Yardımcı: Stream → string
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
