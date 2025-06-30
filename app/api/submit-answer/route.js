// app/api/submit-answer/route.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { hashIp } from '../../lib/ipHash';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const r2 = new S3Client({
    region: process.env.R2_PDF_REGION,
    endpoint: process.env.R2_PDF_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_PDF_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_PDF_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.R2_PDF_BUCKET;

// Yardımcı: stream'i string'e çevir
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
}

export async function POST(req) {
    try {
        const { questionId, content, nickname, source } = await req.json();

        if (!questionId || !content) {
            return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
        }
        // Eğer nickname zorunluysa kontrolü açabilirsin:
        // if (!nickname) return NextResponse.json({ error: "Takma ad zorunlu." }, { status: 400 });

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
        const ipHash = await hashIp(ip);
        const today = new Date().toISOString().slice(0, 10);
        const rateKey = `rate-limit/${ipHash}-${today}.json`;

        // Cevap limiti kontrolü (günlük 10)
        let rate = { answers: 0 };
        try {
            const existing = await r2.send(new GetObjectCommand({
                Bucket: BUCKET,
                Key: rateKey,
            }));
            const body = await streamToString(existing.Body);
            rate = JSON.parse(body);
        } catch (_) { }

        if ((rate.answers || 0) >= 10) {
            return NextResponse.json({ error: 'Günlük 10 cevap limitine ulaşıldı.' }, { status: 403 });
        }

        // ⭐️ Burada rozet/badge logic!
        let badges = [];
        if (Math.random() < 0.12) { // %12 şansla AI rozeti ver
            badges.push("ai-starred");
        }

        // Cevap kaydı oluştur
        const id = crypto.randomUUID();
        const created_at = new Date().toISOString();

        const answer = {
            id,
            question_id: questionId,
            content,
            nickname,
            created_at,
            badges,
            ...(source ? { source } : {}),
        };

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `answers/${id}.json`,
            Body: JSON.stringify(answer, null, 2),
            ContentType: 'application/json',
        }));

        // Rate limit dosyasını güncelle
        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: rateKey,
            Body: JSON.stringify({
                ...rate,
                answers: (rate.answers || 0) + 1,
            }),
            ContentType: 'application/json',
        }));

        // Dönüşte badge bilgisini ilet
        return NextResponse.json({ status: 'ok', id, badges }, { status: 200 });
    } catch (err) {
        console.error('Submit Answer Error:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
