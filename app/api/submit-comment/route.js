// app/api/submit-comment/route.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { hashIp } from '../../lib/ipHash';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Güncel Cloudflare R2 env key'leriyle!
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
        const { answerId, content } = await req.json();

        if (!answerId || !content || !content.trim()) {
            return NextResponse.json({ error: 'Eksik veya boş veri' }, { status: 400 });
        }

        // IP hash
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
        const iphash = await hashIp(ip);

        // Yorum kaydının dosya ismi
        const id = crypto.randomUUID();
        const key = `comments/${answerId}-${id}.json`;

        const comment = {
            id,
            answer_id: answerId,
            content,
            ip_hash: iphash,
            created_at: new Date().toISOString(),
        };

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: JSON.stringify(comment, null, 2),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: 'ok', comment }, { status: 200 });
    } catch (err) {
        console.error('Submit Comment Error:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
