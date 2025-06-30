// api/vote-resource-tag-suggestion/route.js

import { NextResponse } from "next/server";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.R2_BUCKET;
const RESOURCES_JSON_KEY = "resources.json";

export async function POST(req) {
    try {
        const { suggestionId, delta } = await req.json();
        if (!suggestionId || ![1, -1].includes(delta)) {
            return NextResponse.json({ error: "Eksik veya yanlış parametre" }, { status: 400 });
        }
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";
        const userIp = ip;

        // Tüm kaynakları oku
        let resourcesArr = [];
        try {
            const { Body } = await r2Client.send(new GetObjectCommand({
                Bucket: R2_BUCKET,
                Key: RESOURCES_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            resourcesArr = JSON.parse(jsonStr);
        } catch { resourcesArr = []; }

        let found = false;
        for (const res of resourcesArr) {
            if (Array.isArray(res.suggestions)) {
                const sug = res.suggestions.find(s => s.id === suggestionId);
                if (sug) {
                    if (!Array.isArray(sug.userIps)) sug.userIps = [];
                    // Aynı kullanıcıdan tekrar oy engeli
                    if (sug.userIps.includes(userIp)) {
                        return NextResponse.json({ error: "Zaten oy verdiniz" }, { status: 429 });
                    }
                    // Upvote/decrement sınırı
                    sug.upvotes = Math.max(0, (sug.upvotes || 0) + delta);
                    sug.userIps.push(userIp);
                    found = true;
                    break;
                }
            }
        }
        if (!found) return NextResponse.json({ error: "Öneri yok" }, { status: 404 });

        // Geri yaz
        await r2Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: RESOURCES_JSON_KEY,
            Body: Buffer.from(JSON.stringify(resourcesArr, null, 2)),
            ContentType: "application/json",
            ACL: "public-read"
        }));

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
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
