// app/api/suggest-resource-tag/route.js

import { NextResponse } from "next/server";
import { r2Client } from "../../../app/lib/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.R2_BUCKET;
const RESOURCES_JSON_KEY = "resources.json";

export async function POST(req) {
    try {
        const { resourceId, tag } = await req.json();
        if (!resourceId || !tag) {
            return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
        }

        // Kullanıcı ip hash (abuse engeli)
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
        const userIp = ip;

        // R2'dan veri çek
        let resourcesArr = [];
        try {
            const { Body } = await r2Client.send(new GetObjectCommand({
                Bucket: R2_BUCKET,
                Key: RESOURCES_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            resourcesArr = JSON.parse(jsonStr);
            if (!Array.isArray(resourcesArr)) resourcesArr = [];
        } catch {
            resourcesArr = [];
        }

        const idx = resourcesArr.findIndex(r => r.id === resourceId);
        if (idx === -1) return NextResponse.json({ error: "Kaynak yok" }, { status: 404 });

        const resObj = resourcesArr[idx];
        resObj.suggestions = Array.isArray(resObj.suggestions) ? resObj.suggestions : [];

        // Aynı kullanıcı aynı tagi önerdiyse tekrar ekleme
        const found = resObj.suggestions.find(
            s => s.tag === tag && Array.isArray(s.userIps) && s.userIps.includes(userIp)
        );
        if (found) {
            return NextResponse.json({ error: "Bu etiketi zaten önerdiniz" }, { status: 429 });
        }

        // Daha önce önerilmişse sadece upvote ekle, IP'yi kaydet
        const suggestion = resObj.suggestions.find(s => s.tag === tag);
        if (suggestion) {
            suggestion.upvotes = (suggestion.upvotes || 1) + 1;
            suggestion.userIps = Array.isArray(suggestion.userIps)
                ? Array.from(new Set([...suggestion.userIps, userIp]))
                : [userIp];
        } else {
            // Yeni öneri ekle
            resObj.suggestions.push({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                tag,
                upvotes: 1,
                userIps: [userIp]
            });
        }

        // Geri yaz
        resourcesArr[idx] = resObj;
        await r2Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: RESOURCES_JSON_KEY,
            Body: Buffer.from(JSON.stringify(resourcesArr, null, 2)),
            ContentType: "application/json",
            ACL: "public-read"
        }));

        return NextResponse.json({ success: true, suggestions: resObj.suggestions }, { status: 200 });
    } catch (err) {
        console.error("Tag önerisi hatası:", err);
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
