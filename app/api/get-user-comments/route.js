// app/api/get-user-comments/route.js

import { NextResponse } from 'next/server';
import { metaClient } from "@/app/lib/r2";
import { GetObjectCommand } from '@aws-sdk/client-s3';

const META_BUCKET = process.env.R2_META_BUCKET;
const COMMENTS_KEY = 'comments.json';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get('nick');
    if (!nickname) {
        return NextResponse.json({ error: 'Nickname gerekli.' }, { status: 400 });
    }

    try {
        const { Body } = await metaClient.send(
            new GetObjectCommand({ Bucket: META_BUCKET, Key: COMMENTS_KEY })
        );
        const jsonStr = await streamToString(Body);
        const comments = JSON.parse(jsonStr);

        // nickname'e sahip tüm yorumlar
        const userComments = comments.filter(c => c.nickname === nickname);

        return NextResponse.json({ comments: userComments }, { status: 200 });
    } catch (err) {
        console.error('Yorumlar çekilemedi:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

// Cloudflare stream -> string çevirici
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}
