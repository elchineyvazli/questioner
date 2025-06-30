// app/api/like-resource-comment/route.js

import { NextResponse } from "next/server";
import { metaClient } from "@/app/lib/r2";
import { hashIp } from "@/app/lib/ipHash";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const META_BUCKET = process.env.R2_META_BUCKET;
const COMMENTS_JSON_KEY = "comments.json";

export async function POST(req) {
    try {
        const { commentId } = await req.json();
        if (!commentId) return NextResponse.json({ error: "Eksik ID." }, { status: 400 });

        // Kullanıcı hash (anonim ortam için)
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-real-ip") ||
            "0.0.0.0";
        const userHash = await hashIp(ip);

        // Yorumları oku
        let arr = [];
        try {
            const { Body } = await metaClient.send(new GetObjectCommand({
                Bucket: META_BUCKET,
                Key: COMMENTS_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            arr = JSON.parse(jsonStr);
            if (!Array.isArray(arr)) arr = [];
        } catch {
            arr = [];
        }

        const idx = arr.findIndex(c => c.id === commentId);
        if (idx === -1)
            return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });

        // Tekrar like engeli
        if (!arr[idx].likes) arr[idx].likes = [];
        if (arr[idx].likes.includes(userHash))
            return NextResponse.json({ error: "Daha önce beğendiniz." }, { status: 409 });

        arr[idx].likes.push(userHash);

        // Güncellenmiş yorumlar listesini kaydet
        await metaClient.send(new PutObjectCommand({
            Bucket: META_BUCKET,
            Key: COMMENTS_JSON_KEY,
            Body: Buffer.from(JSON.stringify(arr, null, 2)),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json({ success: true, likes: arr[idx].likes.length });
    } catch (err) {
        console.error("Like hatası:", err);
        return NextResponse.json({ error: "Beğenilemedi." }, { status: 500 });
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
