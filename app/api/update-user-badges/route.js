// app/api/update-user-badges/route.js
import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { calculateBadgesForUser } from '@/app/lib/badgeUtils';

// Senin ortam değişkenlerinden!
const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;
const ANSWERS_KEY = 'answers.json';
const RESOURCES_KEY = 'resources.json';
const SUPPORTERS_KEY = 'supporters.json'; // R2'deki destekçi verisi

export async function POST(req) {
    try {
        const { nickname } = await req.json();
        if (!nickname) {
            return NextResponse.json({ error: 'Kullanıcı adı gerekli.' }, { status: 400 });
        }

        const [answersData, resourcesData, supportersData] = await Promise.all([
            fetchJsonFromR2(ANSWERS_KEY),
            fetchJsonFromR2(RESOURCES_KEY),
            fetchJsonFromR2(SUPPORTERS_KEY)
        ]);

        const newBadges = calculateBadgesForUser(
            nickname,
            answersData,
            resourcesData,
            supportersData
        );

        return NextResponse.json({ badges: newBadges }, { status: 200 });
    } catch (err) {
        console.error('Rozet güncelleme hatası:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

async function fetchJsonFromR2(key) {
    try {
        const { Body } = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        const jsonStr = await streamToString(Body);
        return JSON.parse(jsonStr);
    } catch (err) {
        console.warn(`${key} dosyası okunamadı, boş dizi dönülüyor.`);
        return [];
    }
}

async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}
