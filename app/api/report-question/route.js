// app/api/report-question/route.js
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { hashIp } from "@/app/lib/ipHash";
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

// IP çekme helper (Cloudflare/NGINX/proxy uyumlu)
function getClientIp(headers) {
    return (
        headers.get("x-real-ip") ||
        headers.get("x-forwarded-for")?.split(",")[0] ||
        "0.0.0.0"
    );
}

export async function POST(req) {
    try {
        const { questionId, reason } = await req.json();
        if (!questionId)
            return NextResponse.json({ error: "Eksik id" }, { status: 400 });

        const iphash = await hashIp(getClientIp(req.headers));
        const key = `reports/question-${questionId}-${iphash}.json`;

        // Aynı IP (hash) aynı soruyu tekrar raporlayamaz
        try {
            await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
            return NextResponse.json(
                { error: "Bu soruyu zaten raporladınız." },
                { status: 409 }
            );
        } catch {
            // Dosya yoksa devam
        }

        const report = {
            id: crypto.randomUUID(),
            question_id: questionId,
            reason: typeof reason === "string" ? reason.slice(0, 280) : "user-report",
            reported_at: new Date().toISOString(),
        };

        await r2.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: JSON.stringify(report),
                ContentType: "application/json",
            })
        );

        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (err) {
        console.error("Report error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
