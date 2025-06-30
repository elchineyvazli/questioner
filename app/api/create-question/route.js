// app/api/create-question/route.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import crypto from "crypto";

const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;

export async function POST(req) {
    try {
        const { content, category } = await req.json();

        if (!content || content.trim().length < 10) {
            return NextResponse.json({ error: "Soru çok kısa" }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const created_at = new Date().toISOString();

        const question = {
            id,
            content: content.trim(),
            category: category || "Genel",
            created_at,
            votes: 0,
            answers: []
        };

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `questions/${id}.json`,
            Body: JSON.stringify(question, null, 2),
            ContentType: "application/json",
        }));

        return NextResponse.json({ status: "ok", id, question }, { status: 200 });

    } catch (err) {
        console.error("Create question error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
