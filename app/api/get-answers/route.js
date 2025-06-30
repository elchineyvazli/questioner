// app/api/get-answers/route.js
import { NextResponse } from 'next/server';
import { metaClient } from '@/app/lib/r2';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

export async function POST(req) {
    try {
        const { questionId } = await req.json();

        if (!questionId) {
            return NextResponse.json({ error: 'Eksik questionId' }, { status: 400 });
        }

        const list = await metaClient.send(new ListObjectsV2Command({
            Bucket: process.env.R2_META_BUCKET,
            Prefix: 'answers/',
        }));

        const answers = [];

        for (const file of list.Contents || []) {
            if (!file.Key.endsWith('.json')) continue;

            const get = await metaClient.send(new GetObjectCommand({
                Bucket: process.env.R2_META_BUCKET,
                Key: file.Key,
            }));

            const body = await streamToString(get.Body);

            try {
                const answer = JSON.parse(body);
                if (answer.question_id === questionId) {
                    answers.push(answer);
                }
            } catch (_) { }
        }

        answers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return NextResponse.json({ answers }, { status: 200 });
    } catch (err) {
        console.error('Get Answers Error:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
