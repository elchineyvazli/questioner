// app/api/report-comment/route.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from "next/server";
import crypto from "crypto";

const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;

export async function POST(req) {
    try {
        const { commentId, reason } = await req.json();
        if (!commentId) {
            return NextResponse.json({ error: 'Eksik id' }, { status: 400 });
        }

        // Kullanıcı IP tespiti
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('cf-connecting-ip') ||
            req.headers.get('x-real-ip') ||
            "0.0.0.0";
        const key = `reports/comment-${commentId}-${ip}.json`;

        // Aynı IP ile aynı yoruma tekrar rapor engeli
        try {
            await r2.send(new GetObjectCommand({
                Bucket: BUCKET,
                Key: key,
            }));
            return NextResponse.json({ error: "Bu yorumu zaten raporladınız." }, { status: 409 });
        } catch { /* Yoksa devam */ }

        const report = {
            id: crypto.randomUUID(),
            comment_id: commentId,
            reason: typeof reason === "string" ? reason.slice(0, 280) : "user-report",
            ip,
            reported_at: new Date().toISOString(),
        };

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: JSON.stringify(report),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (err) {
        console.error('Report error:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
