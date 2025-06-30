// app/api/get-questions-by-tag/route.js

import { NextResponse } from 'next/server';
import { metaClient } from '@/app/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.R2_META_BUCKET;
const KEY = 'questions.json';

export async function POST(req) {
    try {
        const { tag } = await req.json();
        if (!tag) {
            return NextResponse.json({ error: 'Etiket gerekli.' }, { status: 400 });
        }

        const { Body } = await metaClient.send(new GetObjectCommand({
            Bucket: BUCKET,
            Key: KEY,
        }));

        const jsonStr = await streamToString(Body);
        const allQuestions = JSON.parse(jsonStr);
        const filtered = allQuestions.filter(q =>
            Array.isArray(q.tags) && q.tags.includes(tag)
        );

        return NextResponse.json({ questions: filtered }, { status: 200 });
    } catch (err) {
        console.error('Tag filtreleme hatası:', err);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}

// S3 veri akışını stringe çevirme
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}
