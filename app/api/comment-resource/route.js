// app/api/comment-resource/route.js

import { NextResponse } from "next/server";
import { metaClient } from "../../../app/lib/r2"; // Artık metaClient!
import { hashIp } from "../../../app/lib/ipHash";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_META_BUCKET = process.env.R2_META_BUCKET;
const COMMENTS_JSON_KEY = "comments.json";

export async function POST(req) {
    try {
        const { resourceId, content } = await req.json();
        if (!resourceId || !content || content.length < 2)
            return NextResponse.json({ error: "Eksik veri." }, { status: 400 });

        // Kullanıcı IP hash (kimliksiz ortam için)
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-real-ip") ||
            "0.0.0.0";
        const userHash = await hashIp(ip);

        // Mevcut yorumları oku
        let arr = [];
        try {
            const { Body } = await metaClient.send(new GetObjectCommand({
                Bucket: R2_META_BUCKET,
                Key: COMMENTS_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            arr = JSON.parse(jsonStr);
            if (!Array.isArray(arr)) arr = [];
        } catch {
            arr = [];
        }

        // Yeni yorum objesi
        const now = new Date().toISOString();
        const newComment = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            resourceId,
            content,
            by: userHash,
            createdAt: now,
            likes: [],
            reports: []
        };
        arr.unshift(newComment);

        // Yaz ve dön
        const jsonBody = JSON.stringify(arr, null, 2);
        await metaClient.send(new PutObjectCommand({
            Bucket: R2_META_BUCKET,
            Key: COMMENTS_JSON_KEY,
            Body: Buffer.from(jsonBody),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json({ success: true, comment: newComment }, { status: 200 });
    } catch (err) {
        console.error("Yorum ekleme hatası:", err);
        return NextResponse.json({ error: "Yorum eklenemedi." }, { status: 500 });
    }
}

async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
