// app/api/get-user-questions/route.js

import { NextResponse } from 'next/server';
import { metaClient } from "@/app/lib/r2";
import { GetObjectCommand } from '@aws-sdk/client-s3';

const META_BUCKET = process.env.R2_META_BUCKET;
const QUESTIONS_KEY = 'questions.json'; // Sadece `questions.json` dosyası okunacak

async function readJSONFromR2(key) {
    const { Body } = await metaClient.send(
        new GetObjectCommand({ Bucket: META_BUCKET, Key: key })
    );
    const chunks = [];
    for await (const chunk of Body) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const jsonStr = Buffer.concat(chunks).toString('utf-8');
    return JSON.parse(jsonStr);
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get('nick');

    if (!nickname) {
        return NextResponse.json({ error: 'nick parametresi eksik' }, { status: 400 });
    }

    try {
        const questions = await readJSONFromR2(QUESTIONS_KEY);
        // nickname alanı ile eşleşen soruları filtrele
        const userQuestions = questions.filter(q => q.nickname === nickname);
        return NextResponse.json({ questions: userQuestions }, { status: 200 });
    } catch (err) {
        console.error('Kullanıcı soruları çekilemedi:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
