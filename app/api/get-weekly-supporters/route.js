// app/api/get-weekly-supporters/route.js

import { NextResponse } from "next/server";
import {
    S3Client,
    GetObjectCommand,
    ListObjectsV2Command
} from "@aws-sdk/client-s3";

const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;

export async function GET(req) {
    try {
        const now = Date.now();
        let all = [];

        // 1. Stripe destekçileri
        try {
            const { Body } = await r2.send(
                new GetObjectCommand({ Bucket: BUCKET, Key: "supporters.json" })
            );
            const jsonStr = await streamToString(Body);
            const stripeSupporters = JSON.parse(jsonStr) || [];
            all.push(...stripeSupporters);
        } catch (err) {
            if (err.name !== "NoSuchKey") console.error("Stripe destekçileri yüklenemedi:", err);
        }

        // 2. Kripto destekçileri (crypto-success/*.json)
        try {
            const list = await r2.send(
                new ListObjectsV2Command({
                    Bucket: BUCKET,
                    Prefix: "crypto-success/"
                })
            );

            const cryptoFiles = list.Contents || [];
            for (const file of cryptoFiles) {
                const obj = await r2.send(
                    new GetObjectCommand({ Bucket: BUCKET, Key: file.Key })
                );
                const text = await streamToString(obj.Body);
                const data = JSON.parse(text);
                all.push({
                    nickname: data.nickname || "Anonim",
                    message: data.message || "",
                    amount: data.amount,
                    createdAt: data.createdAt,
                });
            }
        } catch (err) {
            console.error("Kripto destekçiler alınamadı:", err);
        }

        // 3. Son 7 güne filtreleme
        const weekly = all.filter(
            (s) =>
                s.createdAt &&
                Date.parse(s.createdAt) > now - 7 * 24 * 60 * 60 * 1000
        );

        weekly.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)).reverse();

        return NextResponse.json({ supporters: weekly }, { status: 200 });
    } catch (err) {
        console.error("Weekly supporters API error:", err);
        return NextResponse.json({ supporters: [], error: "Sunucu hatası" }, { status: 500 });
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
