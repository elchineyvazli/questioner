// app/api/report/route.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

// Yeni: Ortak PDF R2 değişkenlerini kullan!
const r2 = new S3Client({
    region: process.env.R2_PDF_REGION,
    endpoint: process.env.R2_PDF_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_PDF_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_PDF_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_PDF_BUCKET;

export async function POST(req) {
    try {
        const { type, id, reason } = await req.json();
        if (!type || !id) {
            return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
        }
        if (!["question", "answer"].includes(type)) {
            return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
        }

        // IP'yi temizle ve hash (kimliksiz ortamlar için!)
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('cf-connecting-ip') ||
            req.headers.get('x-real-ip') ||
            "0.0.0.0";

        const key = `reports/${type}-${id}-${ip}.json`;

        // Zaten raporlanmış mı kontrolü
        try {
            await r2.send(new GetObjectCommand({
                Bucket: BUCKET,
                Key: key,
            }));
            return NextResponse.json({ error: "Bu içeriği zaten raporladınız." }, { status: 409 });
        } catch { /* Yoksa devam et */ }

        // Reason'ı sınırla (kötüye kullanım engeli için)
        let reasonText = typeof reason === "string" ? reason.slice(0, 280) : null;

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: JSON.stringify({
                type,
                [`${type}_id`]: id,
                ip,
                reason: reasonText,
                created_at: new Date().toISOString(),
            }),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: "ok" }, { status: 200 });

    } catch (err) {
        console.error("Report API error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
