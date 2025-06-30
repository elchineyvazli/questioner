// app/api/submit-question/route.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { hashIp } from '@/app/lib/ipHash';
import crypto from 'crypto';

const r2 = new S3Client({
  region: process.env.R2_META_REGION,
  endpoint: process.env.R2_META_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.R2_META_BUCKET;

const ALLOWED_CATEGORIES = ['Felsefe', 'Fizik', 'Din', 'Kimya', 'Sosyoloji'];

function getClientIp(headers) {
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0] ||
    '0.0.0.0'
  );
}

export async function POST(req) {
  try {
    const { content, category } = await req.json();

    // 1. Veri Doğrulama
    if (!content || !category) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    if (typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json({ error: 'Soru çok kısa' }, { status: 400 });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Geçersiz kategori' }, { status: 400 });
    }

    // 2. IP hash
    const iphash = await hashIp(getClientIp(req.headers));

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    const newQuestion = {
      id,
      content: content.trim().slice(0, 280),
      category,
      created_at,
      iphash,
    };

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: `questions/${id}.json`,
        Body: JSON.stringify(newQuestion, null, 2),
        ContentType: 'application/json',
      })
    );

    return NextResponse.json({ status: 'ok', id }, { status: 200 });
  } catch (err) {
    console.error('Submit Question Error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
