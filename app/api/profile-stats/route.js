// app/api/profile-stats/route.js

import { NextResponse } from 'next/server';
import { metaClient } from '@/app/lib/r2'; // yeni mimaride metadata bucket
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { calculateBadgesForUser } from '@/app/lib/badgeUtils';

const BUCKET = process.env.R2_META_BUCKET;

async function readJSONFromR2(key) {
    const { Body } = await metaClient.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
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
        return NextResponse.json({ error: 'Nickname gerekli.' }, { status: 400 });
    }

    try {
        const [answers, resources] = await Promise.all([
            readJSONFromR2('answers.json'),
            readJSONFromR2('resources.json'),
        ]);

        const userAnswers = answers.filter(a => a.nickname === nickname);
        const aiStarred = userAnswers.filter(a => a.badges?.includes('ai-starred')).length;

        const badges = calculateBadgesForUser(nickname, answers, resources);

        return NextResponse.json({
            totalAnswers: userAnswers.length,
            aiStarred,
            badges,
        });
    } catch (err) {
        console.error('Profil istatistik hatası:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
