// app/api/submit-resource/route.js

import { NextResponse } from "next/server";
import { uploadPDFToR2, r2Client } from "../../../app/lib/r2";
import { hashIp } from "../../../app/lib/ipHash";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 settings
const R2_BUCKET = process.env.R2_BUCKET;
const RESOURCES_JSON_KEY = "resources.json"; // bucket'ta JSON dosyasının adı

export async function POST(req) {
    try {
        // 1. Form verilerini al (multipart/form-data veya JSON)
        const contentType = req.headers.get("content-type");
        let fields = {};
        let pdfBuffer, pdfFilename, pdfMimetype;

        if (contentType && contentType.includes("multipart/form-data")) {
            // Multipart parse
            const formData = await req.formData();
            fields.title = formData.get("title")?.toString();
            fields.description = formData.get("description")?.toString();
            fields.url = formData.get("url")?.toString();

            const pdfFile = formData.get("pdf");
            if (pdfFile && pdfFile.size > 0) {
                pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
                pdfFilename = `${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9_.-]/g, "")}`;
                pdfMimetype = pdfFile.type;
            }
        } else {
            // JSON parse
            const data = await req.json();
            fields = data;
            // (PDF desteği sadece multipart ile)
        }

        // 2. Minimum validasyon
        if (!fields.title || fields.title.length < 2)
            return NextResponse.json({ error: "Başlık eksik veya çok kısa." }, { status: 400 });

        // 3. Kullanıcı IP'si hashle
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";
        const uploadedBy = await hashIp(ip);

        // 4. PDF yükle (varsa)
        let pdfUrl = null;
        if (pdfBuffer) {
            pdfUrl = await uploadPDFToR2({
                fileBuffer: pdfBuffer,
                filename: pdfFilename,
                mimetype: pdfMimetype || "application/pdf",
            });
        }

        // 5. Mevcut kaynaklar JSON'unu R2'dan çek
        let resourcesArr = [];
        try {
            const { Body } = await r2Client.send(new GetObjectCommand({
                Bucket: R2_BUCKET,
                Key: RESOURCES_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            resourcesArr = JSON.parse(jsonStr);
            if (!Array.isArray(resourcesArr)) resourcesArr = [];
        } catch (e) {
            resourcesArr = [];
        }

        // 6. Yeni kaynak objesini oluştur
        const now = new Date().toISOString();
        const newResource = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            title: fields.title,
            description: fields.description || "",
            url: fields.url || "",
            pdfUrl,
            uploadedBy,
            createdAt: now,
            tags: [], // AI/mod ekleyecek
            status: "pending", // Sonradan "approved" olacak
            reviewLog: [],
            reports: []
        };

        // 7. Listeye ekle ve tekrar R2'ya yaz
        resourcesArr.unshift(newResource); // en başa ekle
        const jsonBody = JSON.stringify(resourcesArr, null, 2);

        await r2Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: RESOURCES_JSON_KEY,
            Body: Buffer.from(jsonBody),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        // 8. Sonuç dön
        return NextResponse.json({ success: true, resource: newResource }, { status: 200 });

    } catch (err) {
        console.error("Resource ekleme hatası:", err);
        return NextResponse.json({ error: "Kaynak eklenirken hata oluştu." }, { status: 500 });
    }
}

// Cloudflare stream => string çevirici
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
