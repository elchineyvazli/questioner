// app/api/add-answer/route.js
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { hashIp } from "@/app/lib/ipHash";
import { getServerSession } from "next-auth";
import authOptions from "../../lib/authOptions";

const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.R2_META_BUCKET;

// Helper: stream -> string
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString("utf-8");
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { questionId, content } = body;
        if (!questionId || !content?.trim()) {
            return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
        }

        // Soru verisini getir
        let questionData;
        try {
            const obj = await r2.send(new GetObjectCommand({
                Bucket: BUCKET,
                Key: `questions/${questionId}.json`,
            }));
            const raw = await streamToString(obj.Body);
            questionData = JSON.parse(raw);
        } catch {
            return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
        }

        const cleanContent = content.trim().slice(0, 1000);
        if (cleanContent.length < 10) {
            return NextResponse.json({ error: "Cevap çok kısa" }, { status: 400 });
        }

        // Giriş yapan kullanıcıyı bul
        const session = await getServerSession({ req, ...authOptions });
        let userKey = null;

        if (session?.user?.email) {
            userKey = `uid-${session.user.email}`;
        } else {
            // IP fallback
            const ip =
                req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                req.headers.get("cf-connecting-ip") ||
                req.headers.get("x-real-ip") ||
                "0.0.0.0";
            const iphash = await hashIp(ip);
            userKey = `ip-${iphash}`;
        }

        // 4 saatlik dilim hesapla
        const now = new Date();
        const rounded = new Date(Math.floor(now.getTime() / (4 * 60 * 60 * 1000)) * (4 * 60 * 60 * 1000));
        const rateKey = `answers/${questionId}-${userKey}-${rounded.toISOString()}.json`;

        try {
            await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: rateKey }));
            return NextResponse.json({ error: "Bu soruya 4 saatte bir cevap verebilirsin." }, { status: 429 });
        } catch { /* devam et */ }

        const id = crypto.randomUUID();
        const answer = {
            id,
            question_id: questionId,
            content: cleanContent,
            user: session?.user?.name || "Anonim",
            user_email: session?.user?.email || null,
            created_at: now.toISOString(),
        };

        // 1. Rate-limit log'u
        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: rateKey,
            Body: JSON.stringify(answer, null, 2),
            ContentType: "application/json",
        }));

        // 2. Sorunun cevabına ekle
        const updatedQuestion = {
            ...questionData,
            answers: Array.isArray(questionData.answers)
                ? [answer, ...questionData.answers]
                : [answer],
        };

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `questions/${questionId}.json`,
            Body: JSON.stringify(updatedQuestion, null, 2),
            ContentType: "application/json",
        }));

        return NextResponse.json({ status: "ok", answer }, { status: 200 });
    } catch (err) {
        console.error("Add Answer Error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
