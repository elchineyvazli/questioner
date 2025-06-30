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

export async function POST(req) {
    try {
        const { groupId, nickname } = await req.json();
        if (!groupId || !nickname) {
            return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
        }

        const key = `groups/${groupId}.json`;
        // Grup dosyasını oku
        let group, Body;
        try {
            ({ Body } = await r2.send(new GetObjectCommand({
                Bucket: process.env.R2_META_BUCKET,
                Key: key
            })));
            const buf = [];
            for await (const chunk of Body) buf.push(chunk);
            group = JSON.parse(Buffer.concat(buf).toString('utf-8'));
        } catch (err) {
            return NextResponse.json({ error: "Grup bulunamadı." }, { status: 404 });
        }

        // Zaten üye mi? (case-insensitive kontrol)
        const alreadyMember = group.members.some(m => m.toLowerCase() === nickname.toLowerCase());
        if (alreadyMember) {
            return NextResponse.json({ status: "already-member" }, { status: 200 });
        }

        group.members.push(nickname);

        // Güncellenmiş grup dosyasını kaydet
        await r2.send(new PutObjectCommand({
            Bucket: process.env.R2_META_BUCKET,
            Key: key,
            Body: JSON.stringify(group, null, 2),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (err) {
        console.error("Gruba katılma hatası:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
