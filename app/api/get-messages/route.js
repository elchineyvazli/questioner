// app/api/get-messages/route.js
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
}

export async function GET(req) {
    // groupId, channelId çek
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const channelId = searchParams.get('channelId');
    if (!groupId || !channelId) {
        return NextResponse.json({ messages: [] });
    }
    try {
        const { Body } = await r2.send(new GetObjectCommand({
            Bucket: process.env.R2_META_BUCKET,
            Key: `groups/${groupId}/channels/${channelId}.json`
        }));
        const messagesJson = await streamToString(Body);
        const messages = JSON.parse(messagesJson);
        return NextResponse.json({ messages }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ messages: [] }, { status: 200 });
    }
}
