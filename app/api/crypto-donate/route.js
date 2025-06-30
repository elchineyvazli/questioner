// app/api/crypto-donate/route.js
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});
console.log("Cüzdan adresi:", process.env.DONATION_WALLET_ADDRESS);

const BUCKET = process.env.R2_META_BUCKET;

export async function POST(req) {
    try {
        const { nickname, amount, message } = await req.json();

        if (!amount || isNaN(amount) || amount < 1) {
            return NextResponse.json({ error: "Geçersiz miktar" }, { status: 400 });
        }

        // Bekleyen ödemeyi bir dosyada sakla
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const donation = {
            id,
            nickname: nickname || "Anonim",
            message: message || "",
            amount: Number(amount),
            createdAt,
            status: "pending"
        };

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `crypto-pending/${id}.json`,
            Body: JSON.stringify(donation, null, 2),
            ContentType: 'application/json'
        }));

        return NextResponse.json({
            status: "ok",
            cryptoAddress: process.env.DONATION_WALLET_ADDRESS,
            donationId: id
        });
    } catch (err) {
        console.error("Crypto donate API error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
