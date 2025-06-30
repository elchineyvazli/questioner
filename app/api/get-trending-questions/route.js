// app/api/get-trending-questions/route.js
import { NextResponse } from "next/server";
import { metaClient } from "@/app/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const META_BUCKET = process.env.R2_META_BUCKET;
const QUESTIONS_KEY = "questions.json";

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

export async function GET() {
    try {
        const command = new GetObjectCommand({
            Bucket: META_BUCKET,
            Key: QUESTIONS_KEY,
        });

        const { Body } = await metaClient.send(command);
        const jsonStr = await streamToString(Body);
        const allQuestions = JSON.parse(jsonStr) || [];

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // createdAt/created_at desteği + votes fallback
        const trending = allQuestions
            .filter(q => new Date(q.createdAt || q.created_at) >= oneWeekAgo)
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 20);

        return NextResponse.json({ questions: trending }, { status: 200 });
    } catch (err) {
        console.error("Trending fetch error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
