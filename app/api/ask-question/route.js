// app/api/ask-question/route.js
import { NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { metaClient } from "@/app/lib/r2";
import { analyzeResourceWithAI } from "@/app/lib/aiUtils";
import crypto from "crypto";

const META_BUCKET = process.env.R2_META_BUCKET;
const QUESTIONS_KEY = "questions.json";

const ALLOWED_CATEGORIES = ["Felsefe", "Fizik", "Din", "Kimya", "Sosyoloji"];
const MIN_WORDS = 10;
const MAX_LENGTH = 280;

function wordCount(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 1).length;
}

function normalizeText(text) {
    return text.replace(/\s+/g, " ").trim();
}

async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString("utf-8");
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

export async function POST(req) {
    try {
        const body = await req.json();
        const rawContent = (body.content || "").toString();
        const content = normalizeText(rawContent);
        const category = ALLOWED_CATEGORIES.includes(body.category)
            ? body.category
            : "Genel";

        // Validation
        if (!content || wordCount(content) < MIN_WORDS || content.length > MAX_LENGTH) {
            return NextResponse.json(
                { error: "Soru en az 10 kelime içermeli ve 280 karakteri geçmemelidir." },
                { status: 400 }
            );
        }

        // AI Moderation
        const ai = await analyzeResourceWithAI({ text: content });
        if (ai?.abuse === true) {
            return NextResponse.json(
                { error: "AI filtresi: uygunsuz içerik." },
                { status: 400 }
            );
        }

        // Soruları al
        let questions = [];
        try {
            const { Body } = await metaClient.send(
                new GetObjectCommand({ Bucket: META_BUCKET, Key: QUESTIONS_KEY })
            );
            const str = await streamToString(Body);
            questions = JSON.parse(str);
            if (!Array.isArray(questions)) questions = [];
        } catch {
            questions = [];
        }

        // Yeni kayıt
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const newQuestion = {
            id,
            content,
            category,
            createdAt,
            summary: ai?.summary || "",
            tags: ai?.tags || [],
        };
        questions.push(newQuestion);

        // Kaydet questions.json
        await metaClient.send(
            new PutObjectCommand({
                Bucket: META_BUCKET,
                Key: QUESTIONS_KEY,
                Body: Buffer.from(JSON.stringify(questions, null, 2)),
                ContentType: "application/json",
            })
        );

        // Kaydet questions/{id}.json
        await metaClient.send(
            new PutObjectCommand({
                Bucket: META_BUCKET,
                Key: `questions/${id}.json`,
                Body: Buffer.from(JSON.stringify({ ...newQuestion, answers: [] }, null, 2)),
                ContentType: "application/json",
            })
        );

        return NextResponse.json({ status: "ok", id }, { status: 200 });
    } catch (err) {
        console.error("Soru gönderme hatası:", err);
        return NextResponse.json(
            { error: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." },
            { status: 500 }
        );
    }
}
