// app/api/send-message/route.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

export async function POST(req) {
    try {
        const { groupId, channelId, nickname, content } = await req.json();

        if (!groupId || !channelId || !nickname || !content?.trim()) {
            return NextResponse.json({ error: "Tüm alanlar zorunlu." }, { status: 400 });
        }

        // Mesaj dosyasının anahtarı
        const key = `groups/${groupId}/channels/${channelId}.json`;

        // Mevcut mesajları getir
        let messages = [];
        try {
            const { Body } = await r2.send(new GetObjectCommand({
                Bucket: process.env.R2_META_BUCKET,
                Key: key,
            }));
            const jsonStr = await streamToString(Body);
            messages = JSON.parse(jsonStr);
        } catch {
            messages = [];
        }

        // Mesajı ekle (en sona)
        const msg = {
            id: crypto.randomUUID(),
            nickname,
            content: content.trim(),
            sentAt: new Date().toISOString(),
        };
        messages.push(msg);

        // Son 200 mesajı sakla (overflow'u önlemek için)
        if (messages.length > 200) messages = messages.slice(-200);

        await r2.send(new PutObjectCommand({
            Bucket: process.env.R2_META_BUCKET,
            Key: key,
            Body: JSON.stringify(messages, null, 2),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: "ok", message: msg });
    } catch (err) {
        console.error("Mesaj gönderme hatası:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// S3 stream'i stringe çevir
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
