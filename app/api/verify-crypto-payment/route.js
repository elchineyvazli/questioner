// app/api/verify-crypto-payment/route.js
import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// TronWeb'i dinamik olarak import ediyoruz
const TronWeb = (await import('tronweb')).default;

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

export const dynamic = 'force-dynamic'; // Bu rotayı dinamik yap

export async function POST(req) {
  try {
    const { donationId } = await req.json();
    if (!donationId) {
      return NextResponse.json({ error: 'Eksik ID' }, { status: 400 });
    }

    // TronWeb'i her istekte yeniden oluştur
    const tronWeb = new TronWeb({
      fullHost: process.env.TRON_NODE_URL || 'https://api.trongrid.io',
      headers: {
        'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const key = `crypto-pending/${donationId}.json`;
    const file = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const json = JSON.parse(await streamToString(file.Body));
    const expectedAmount = parseFloat(json.amount);

    const transactions = await tronWeb.getEventResult(USDT_CONTRACT, {
      eventName: 'Transfer',
      size: 100,
      sort: 'desc',
      min_block_timestamp: Date.now() - 86400000 // Son 24 saat
    });

    const match = transactions.find(
      (tx) =>
        tx.result &&
        tx.result.to?.toLowerCase() === process.env.DONATION_WALLET_ADDRESS.toLowerCase() &&
        parseFloat(tronWeb.toDecimal(tx.result.value)) / 1e6 >= expectedAmount
    );

    if (match) {
      const confirmed = {
        ...json,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        txid: match.transaction_id
      };

      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: `crypto-confirmed/${donationId}.json`,
          Body: JSON.stringify(confirmed, null, 2),
          ContentType: 'application/json',
        })
      );

      return NextResponse.json({ status: 'confirmed' });
    }

    return NextResponse.json({ status: 'pending' });

  } catch (err) {
    console.error('Verify error:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({
      error: 'Sunucu hatası',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}