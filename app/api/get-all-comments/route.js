// app/api/get-all-comments/route.js

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

export async function GET() {
    try {
        // comments/ klasöründeki tüm json dosyalarını listele (maksimum 1000 dosya)
        const listed = await metaClient.send(new ListObjectsV2Command({
            Bucket: process.env.R2_META_BUCKET,
            Prefix: 'comments/',
            MaxKeys: 1000
        }));

        let files = (listed.Contents || [])
            .filter(f => f.Key.endsWith('.json'))
            .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
            .slice(0, 100); // En yeni 100

        const comments = [];
        for (const file of files) {
            try {
                const get = await metaClient.send(new GetObjectCommand({
                    Bucket: process.env.R2_META_BUCKET,
                    Key: file.Key,
                }));
                const body = await streamToString(get.Body);
                const comment = JSON.parse(body);
                comments.push(comment);
            } catch (_) { }
        }
        return NextResponse.json({ comments }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
