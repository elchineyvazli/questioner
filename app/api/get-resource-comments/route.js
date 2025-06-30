// app/api/get-resource-comments/route.js

import { NextResponse } from "next/server";
import { metaClient } from "@/app/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const META_BUCKET = process.env.R2_META_BUCKET;
const COMMENTS_JSON_KEY = "comments.json";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");
    if (!resourceId)
        return NextResponse.json({ error: "resourceId eksik." }, { status: 400 });

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
    // Sadece ilgili kaynağın yorumlarını dön
    const comments = arr.filter(c => c.resourceId === resourceId);
    return NextResponse.json({ comments }, { status: 200 });
}

async function streamToString(stream) {
    if (stream instanceof Buffer) {
        return stream.toString();
    }
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
