import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';

const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;
const tronApiKey = process.env.TRONAPIKEY;
const wallet = process.env.DONATION_WALLET_ADDRESS;

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf-8');
}

export async function POST(req) {
    try {
        const { donationId } = await req.json();
        if (!donationId) {
            return NextResponse.json({ error: "Eksik ID" }, { status: 400 });
        }

        // JSON dosyasını R2'den al
        const key = `crypto-pending/${donationId}.json`;
        const pendingObj = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        const text = await streamToString(pendingObj.Body);
        const donation = JSON.parse(text);

        // TronGrid üzerinden işlemleri al
        const txs = await axios.get(`https://api.trongrid.io/v1/accounts/${wallet}/transactions/trc20`, {
            headers: { 'TRON-PRO-API-KEY': tronApiKey }
        });

        const incoming = txs.data.data || [];

        const expectedRaw = Math.round(donation.amount * 1e6); // USDT (6 desimal)

        const matched = incoming.find(tx => {
            const txRawAmount = parseInt(tx.value);
            const txRecipient = tx.to;

            return (
                txRawAmount === expectedRaw &&
                txRecipient === wallet
            );
        });

        if (!matched) {
            return NextResponse.json({ status: "not-found" });
        }

        // Eşleşme bulundu → başarıya kaydet
        const successKey = `crypto-success/${donation.id}.json`;
        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: successKey,
            Body: JSON.stringify({
                ...donation,
                status: "confirmed",
                confirmedAt: new Date().toISOString(),
                txHash: matched.transaction_id || matched.hash
            }, null, 2),
            ContentType: 'application/json'
        }));

        // İsteğe bağlı: pending dosyasını silmek istersen buraya ekleyebilirim

        return NextResponse.json({ status: "confirmed" });
    } catch (err) {
        console.error("Check Crypto Payment Error:", err);
        return NextResponse.json({ error: "Kontrol başarısız" }, { status: 500 });
    }
}
