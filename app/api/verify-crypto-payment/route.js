// app/api/verify-crypto-payment/route.js
import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import TronWeb from 'tronweb';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_META_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_META_BUCKET;
const USDT_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  headers: { 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY },
});

export async function POST(req) {
  try {
    const { donationId } = await req.json();
    if (!donationId) {
      return NextResponse.json({ error: 'Eksik ID' }, { status: 400 });
    }

    const key = `crypto-pending/${donationId}.json`;
    const file = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const json = JSON.parse(await streamToString(file.Body));
    const expectedAmount = parseFloat(json.amount);

    const transactions = await tronWeb.getEventResult(USDT_CONTRACT, {
      eventName: 'Transfer',
      size: 100,
      sort: 'desc',
    });

    const match = transactions.find(
      (tx) =>
        tx.result &&
        tx.result.to?.toLowerCase() === process.env.DONATION_WALLET_ADDRESS.toLowerCase() &&
        parseFloat(tronWeb.toDecimal(tx.result.value)) / 1e6 >= expectedAmount
    );

    if (match) {
      // Durumu "confirmed" yap
      const confirmed = { ...json, status: 'confirmed', confirmedAt: new Date().toISOString() };
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: `crypto-confirmed/${donationId}.json`,
          Body: JSON.stringify(confirmed, null, 2),
          ContentType: 'application/json',
        })
      );
      return NextResponse.json({ status: 'confirmed' });
    } else {
      return NextResponse.json({ status: 'pending' });
    }
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
