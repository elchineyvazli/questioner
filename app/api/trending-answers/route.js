// app/api/trending-answers/route.js
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;
const ANSWERS_KEY = 'answers.json'; // Eğer cevaplar tek tek answers/ klasöründeyse, ayrıca sor.

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

export async function GET() {
    try {
        const res = await r2.send(new GetObjectCommand({
            Bucket: BUCKET,
            Key: ANSWERS_KEY,
        }));

        const body = await streamToString(res.Body);
        const allAnswers = JSON.parse(body);
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const trending = allAnswers
            .filter(a => new Date(a.created_at).getTime() >= weekAgo)
            .sort((a, b) => ((b.votes || 0) - (a.votes || 0)))
            .slice(0, 10);

        // Eğer votes yoksa, created_at’e göre sıralayalım (fallback)
        if (trending.every(a => !a.votes)) {
            trending.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return NextResponse.json({ trending });
    } catch (err) {
        console.error('Trending fetch error:', err);
        return NextResponse.json({ error: 'Trend listesi alınamadı' }, { status: 500 });
    }
}
