import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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
        const { name, description, isPrivate, tags, creator } = await req.json();

        // Basit validasyon
        if (!name || !creator) {
            return NextResponse.json({ error: "Grup adı ve kurucu zorunlu." }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const group = {
            id,
            name,
            description,
            created_by: creator,
            created_at: createdAt,
            isPrivate: !!isPrivate,
            tags: tags || [],
            members: [creator],
            channels: [{
                id: crypto.randomUUID(),
                name: "Genel Sohbet",
                created_at: createdAt
            }]
        };

        console.log("Bucket:", process.env.R2_META_BUCKET)
        await r2.send(new PutObjectCommand({
            Bucket: process.env.R2_META_BUCKET,
            Key: `groups/${id}.json`,
            Body: JSON.stringify(group, null, 2),
            ContentType: 'application/json',
        }));

        return NextResponse.json({ status: 'ok', group }, { status: 200 });
    } catch (err) {
        console.error("Grup oluşturma hatası:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
