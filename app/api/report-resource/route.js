// app/api/report-resource/route.js

import { NextResponse } from "next/server";
import { hashIp } from "../../../app/lib/ipHash";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.R2_PDF_BUCKET;
const RESOURCES_JSON_KEY = "resources.json";
const REPORT_LIMIT = 3; // Kaç farklı hash'ten sonra flagged

export async function POST(req) {
    try {
        const { resourceId, reason } = await req.json() || {};

        if (!resourceId || typeof reason !== "string" || reason.length < 2) {
            return NextResponse.json({ error: "Eksik veya geçersiz parametre." }, { status: 400 });
        }

        // 1. IP hash (abuse engeli için kimliksiz uniq ID)
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-real-ip") ||
            "0.0.0.0";
        const reporterHash = await hashIp(ip);

        // 2. Kaynakları çek
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
            return NextResponse.json({ error: "Kaynak listesi yok." }, { status: 500 });
        }

        // 3. Kaynağı bul
        const resource = resourcesArr.find(r => r.id === resourceId);
        if (!resource)
            return NextResponse.json({ error: "Kaynak bulunamadı." }, { status: 404 });

        // 4. Tekrar rapor kontrolü (hash'e göre abuse engeli)
        resource.reports = Array.isArray(resource.reports) ? resource.reports : [];
        if (resource.reports.some(r => r.reporterHash === reporterHash)) {
            return NextResponse.json({ error: "Aynı kullanıcı birden çok kez raporlayamaz." }, { status: 429 });
        }

        // 5. Raporu kaydet
        resource.reports.push({
            reporterHash,
            reason: reason.slice(0, 300),
            date: new Date().toISOString(),
        });

        // 6. Flag limitine ulaştıysa status'u güncelle
        const uniqueHashes = new Set(resource.reports.map(r => r.reporterHash));
        if (uniqueHashes.size >= REPORT_LIMIT) {
            resource.status = "flagged";
        }

        // 7. Güncellenmiş JSON'u kaydet
        await r2Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: RESOURCES_JSON_KEY,
            Body: Buffer.from(JSON.stringify(resourcesArr, null, 2)),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json(
            { success: true, flagged: resource.status === "flagged" },
            { status: 200 }
        );

    } catch (err) {
        console.error("Kaynak raporlama hatası:", err);
        return NextResponse.json({ error: "Kaynak raporlanamadı." }, { status: 500 });
    }
}

// R2 stream'i string'e çeviren yardımcı fonksiyon
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
