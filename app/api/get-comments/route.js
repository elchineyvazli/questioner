// app/api/get-comments/route.js
import { metaClient } from '@/app/lib/r2';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

// Helper: stream to string
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
}

export async function POST(req) {
    try {
        const { answerId } = await req.json();
        if (!answerId) {
            return NextResponse.json({ error: 'Eksik answerId' }, { status: 400 });
        }

        // İlgili tüm yorumları listele (meta bucket)
        const list = await metaClient.send(new ListObjectsV2Command({
            Bucket: process.env.R2_META_BUCKET,
            Prefix: `comments/${answerId}-`,
        }));

        const comments = [];
        for (const file of list.Contents || []) {
            if (!file.Key.endsWith('.json')) continue;

            const get = await metaClient.send(new GetObjectCommand({
                Bucket: process.env.R2_META_BUCKET,
                Key: file.Key,
            }));
            const body = await streamToString(get.Body);
            try {
                const comment = JSON.parse(body);
                comments.push(comment);
            } catch (_) { }
        }

        // Yorumları tarihe göre sırala (eskiden yeniye)
        comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return NextResponse.json({ comments }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
