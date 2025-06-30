// app/api/check-donation/route.js

import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;
const TRONGRID_API = 'https://api.trongrid.io/v1/accounts';
const API_KEY = process.env.TRONGRID_API_KEY;
const DONATION_ADDRESS = process.env.DONATION_WALLET_ADDRESS;

async function getTransactions() {
    const res = await fetch(
        `${TRONGRID_API}/${DONATION_ADDRESS}/transactions/trc20?limit=50&only_confirmed=true`,
        {
            headers: { 'TRON-PRO-API-KEY': API_KEY }
        }
    );
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Eksik ID" }, { status: 400 });

        const key = `crypto-pending/${id}.json`;
        const { Body } = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        const buf = [];
        for await (const chunk of Body) buf.push(chunk);
        const donation = JSON.parse(Buffer.concat(buf).toString("utf-8"));

        const expectedAmount = parseFloat(donation.amount);
        const txs = await getTransactions();

        const found = txs.some(tx => {
            const to = tx?.to_address?.toLowerCase();
            const value = parseFloat(tx?.value / 1e6); // USDT is 6 decimals
            return to === DONATION_ADDRESS.toLowerCase() && Math.abs(value - expectedAmount) < 0.0001;
        });

        if (!found) {
            return NextResponse.json({ status: "not_found" }, { status: 200 });
        }

        // Güncelle: pending -> success
        const successKey = `crypto-success/${id}.json`;
        donation.status = "success";
        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: successKey,
            Body: JSON.stringify(donation, null, 2),
            ContentType: 'application/json'
        }));

        return NextResponse.json({ status: "success" }, { status: 200 });
    } catch (err) {
        console.error("Check donation error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
