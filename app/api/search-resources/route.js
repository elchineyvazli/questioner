// app/api/search-resources/route.js

import { NextResponse } from "next/server";
import { r2Client } from "../../../app/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.R2_PDF_BUCKET;
const RESOURCES_JSON_KEY = "resources.json";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = (searchParams.get("query") || "").trim().toLowerCase();
        const tag = searchParams.get("tag");
        const type = searchParams.get("type");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const status = searchParams.get("status") || "approved";

        // 1. Tüm kaynakları çek
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

        // 2. Statü filtresi
        let filtered = resourcesArr.filter(r => (r.status || "approved") === status);

        // 3. Arama & diğer filtreler
        if (query) {
            filtered = filtered.filter(
                r =>
                    (typeof r.title === "string" && r.title.toLowerCase().includes(query)) ||
                    (typeof r.description === "string" && r.description.toLowerCase().includes(query))
            );
        }
        if (tag) {
            filtered = filtered.filter(r => Array.isArray(r.tags) && r.tags.includes(tag));
        }
        if (type === "pdf") {
            filtered = filtered.filter(r => !!r.pdfUrl);
        } else if (type === "url") {
            filtered = filtered.filter(r => !!r.url && !r.pdfUrl);
        }
        if (dateFrom) {
            filtered = filtered.filter(r => r.createdAt && r.createdAt >= dateFrom);
        }
        if (dateTo) {
            filtered = filtered.filter(r => r.createdAt && r.createdAt <= dateTo);
        }

        return NextResponse.json({ resources: filtered }, { status: 200 });

    } catch (err) {
        console.error("Kaynak arama hatası:", err);
        return NextResponse.json({ error: "Kaynaklar yüklenemedi." }, { status: 500 });
    }
}

// Helper
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
