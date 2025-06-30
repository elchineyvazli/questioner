// app/api/get-groups/route.js

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.R2_META_BUCKET;

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Eğer id verilmişse sadece o grubu döndür
    if (id) {
        const key = `groups/${id}.json`;
        try {
            const { Body } = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
            const text = await streamToString(Body);
            const group = JSON.parse(text);
            return NextResponse.json({ groups: [group] });
        } catch (err) {
            console.error("Grup alınamadı:", err);
            return NextResponse.json({ groups: [] });
        }
    }

    // Aksi takdirde tüm grupları listele
    try {
        const list = await r2.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: 'groups/',
        }));

        const keys = (list.Contents || [])
            .filter(obj => obj.Key.endsWith('.json'))
            .map(obj => obj.Key);

        const groups = await Promise.all(keys.map(async (key) => {
            try {
                const { Body } = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
                const text = await streamToString(Body);
                return JSON.parse(text);
            } catch {
                return null;
            }
        }));

        return NextResponse.json({
            groups: groups.filter(Boolean)
        });
    } catch (err) {
        console.error("Gruplar listelenemedi:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
