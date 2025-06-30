// app/api/question-detail/route.js
import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf-8');
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Eksik ID' }, { status: 400 });

        // Soru dosyasını çek
        const key = `questions/${id}.json`;
        const obj = await r2.send(new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        }));

        const str = await streamToString(obj.Body);
        const question = JSON.parse(str);

        const answers = question.answers || [];
        delete question.answers; // UI'da ayrı olarak ele alınıyor

        return NextResponse.json({ question, answers });
    } catch (err) {
        console.error('Soru detay hatası:', err);
        return NextResponse.json({ error: 'Bulunamadı veya bozuk' }, { status: 404 });
    }
}
