import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Cloudflare R2 ayarlarını kendi env’inle eşleştir
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
        const { groupId, name, desc, privacy, topic, creator } = await req.json();
        if (!groupId || !name || !creator) {
            return NextResponse.json({ error: "Eksik veri." }, { status: 400 });
        }
        // 1. Grup dosyasını oku
        const { Body } = await r2.send(new GetObjectCommand({
            Bucket: process.env.R2_META_BUCKET,
            Key: `groups/${groupId}.json`,
        }));
        const groupStr = await streamToString(Body);
        const group = JSON.parse(groupStr);

        // 2. Yeni kanal ekle
        const channel = {
            id: crypto.randomUUID(),
            name: name.trim(),
            description: desc?.trim() || "",
            created_at: new Date().toISOString(),
            privacy: privacy === 'private' ? 'private' : 'public',
            topic: topic?.trim() || "",
            created_by: creator,
            members: [creator],
            messages: [],
        };
        group.channels = group.channels || [];
        group.channels.push(channel);

        // 3. Günücellenmiş grubu tekrar kaydet
        await r2.send(new PutObjectCommand({
            Bucket: process.env.R2_META_BUCKET,
            Key: `groups/${groupId}.json`,
            Body: JSON.stringify(group, null, 2),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: "ok", channel }, { status: 200 });

    } catch (err) {
        console.error("Kanal oluşturma hatası:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// Utility: stream to string
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
