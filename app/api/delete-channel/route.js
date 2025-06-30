// app/api/delete-channel/route.js
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
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
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

export async function POST(req) {
    try {
        const { groupId, channelId, nickname } = await req.json();
        if (!groupId || !channelId || !nickname) {
            return NextResponse.json({ error: "Eksik veri." }, { status: 400 });
        }
        // 1. Grup dosyasını oku
        const { Body } = await r2.send(new GetObjectCommand({
            Bucket: process.env.R2_META_BUCKET,
            Key: `groups/${groupId}.json`,
        }));
        const groupStr = await streamToString(Body);
        const group = JSON.parse(groupStr);

        // **Yetki kontrolü**
        if (group.created_by !== nickname) {
            return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
        }

        // 2. Kanalı sil
        const beforeCount = group.channels.length;
        group.channels = group.channels.filter(c => c.id !== channelId);
        if (group.channels.length === beforeCount) {
            return NextResponse.json({ error: "Kanal bulunamadı." }, { status: 404 });
        }

        // 3. Dosyayı güncelle
        await r2.send(new PutObjectCommand({
            Bucket: process.env.R2_META_BUCKET,
            Key: `groups/${groupId}.json`,
            Body: JSON.stringify(group, null, 2),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: "ok" }, { status: 200 });

    } catch (err) {
        console.error("Kanal silme hatası:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
