// app/api/vote-answer/route.js
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { hashIp } from '../../lib/ipHash';
import { NextResponse } from 'next/server';

// Senin yeni ortam değişkenlerinden!
const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.R2_META_BUCKET;

// Helper: stream to string
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
}

// GET: Beğeni sayısı ve bu IP oy verdi mi?
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const answerId = searchParams.get('id');
    if (!answerId) return NextResponse.json({ error: 'Eksik answerId' }, { status: 400 });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
    const iphash = await hashIp(ip);

    const list = await r2.send(new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `votes/${answerId}-`,
    }));

    let total = 0;
    let alreadyVoted = false;

    for (const file of list.Contents || []) {
        if (!file.Key.endsWith('.json')) continue;
        total++;
        if (file.Key === `votes/${answerId}-${iphash}.json`) {
            alreadyVoted = true;
        }
    }

    return NextResponse.json({ votes: total, alreadyVoted }, { status: 200 });
}

// POST: Oy ekle
export async function POST(req) {
    try {
        const { answerId } = await req.json();
        if (!answerId) return NextResponse.json({ error: 'Eksik answerId' }, { status: 400 });

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
        const iphash = await hashIp(ip);

        const key = `votes/${answerId}-${iphash}.json`;

        // Daha önce oy verilmiş mi kontrol et
        try {
            await r2.send(new GetObjectCommand({
                Bucket: BUCKET,
                Key: key,
            }));
            return NextResponse.json({ error: 'Zaten oy verdiniz.' }, { status: 409 });
        } catch { }

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: JSON.stringify({ answerId, voted_at: new Date().toISOString() }),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
