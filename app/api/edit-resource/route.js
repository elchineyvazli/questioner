// app/api/edit-resource/route.js

import { NextResponse } from "next/server";
import { uploadPDFToR2, pdfClient } from "../../../app/lib/r2";
import { hashIp } from "../../../app/lib/ipHash";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const RESOURCES_JSON_KEY = "resources.json";

export async function POST(req) {
    try {
        const contentType = req.headers.get("content-type");
        let fields = {};
        let pdfBuffer, pdfFilename, pdfMimetype;

        // Hem multipart (dosya) hem JSON (sadece text) destekli
        if (contentType && contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            fields.resourceId = formData.get("resourceId")?.toString();
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
            const data = await req.json();
            fields = data;
            // (PDF sadece multipart ile)
        }

        // Validasyon
        if (!fields.resourceId) return NextResponse.json({ error: "ID eksik." }, { status: 400 });
        if (fields.title && fields.title.length < 2)
            return NextResponse.json({ error: "Başlık çok kısa." }, { status: 400 });

        // Kullanıcı IP hash (kim düzenleyebilir kontrolü)
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";
        const userHash = await hashIp(ip);

        // Kaynakları yükle (pdf bucket!)
        let resourcesArr = [];
        try {
            const { Body } = await pdfClient.send(new GetObjectCommand({
                Bucket: process.env.R2_PDF_BUCKET,
                Key: RESOURCES_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            resourcesArr = JSON.parse(jsonStr);
            if (!Array.isArray(resourcesArr)) resourcesArr = [];
        } catch {
            return NextResponse.json({ error: "Kaynak listesi yok." }, { status: 500 });
        }

        // Kaynağı bul
        const idx = resourcesArr.findIndex(r => r.id === fields.resourceId);
        if (idx === -1) return NextResponse.json({ error: "Kaynak bulunamadı." }, { status: 404 });
        const resource = resourcesArr[idx];

        // Sadece yükleyen veya admin (şimdilik sadece yükleyen) editleyebilir
        if (resource.uploadedBy !== userHash) {
            // İleride burada admin/mod kontrolü eklenebilir!
            return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
        }

        // Status kontrol (flagged kaynağı edit edemez)
        if (resource.status === "flagged") {
            return NextResponse.json({ error: "Flagged (şüpheli) kaynak editlenemez." }, { status: 403 });
        }

        // Alanları güncelle
        if (fields.title) resource.title = fields.title;
        if (typeof fields.description === "string") resource.description = fields.description;
        if (typeof fields.url === "string") resource.url = fields.url;

        // PDF güncelle (varsa yeni yükle)
        if (pdfBuffer) {
            // Eski PDF URL'sini tutmak veya silmek için burada ek fonksiyon yazılabilir.
            resource.pdfUrl = await uploadPDFToR2({
                fileBuffer: pdfBuffer,
                filename: pdfFilename,
                mimetype: pdfMimetype || "application/pdf",
            });
        }

        // Güncelleme logu
        resource.reviewLog = resource.reviewLog || [];
        resource.reviewLog.unshift({
            date: new Date().toISOString(),
            action: "edit",
            by: userHash,
            note: "Kaynak güncellendi",
        });

        const jsonBody = JSON.stringify(resourcesArr, null, 2);
        await pdfClient.send(new PutObjectCommand({
            Bucket: process.env.R2_PDF_BUCKET,
            Key: RESOURCES_JSON_KEY,
            Body: Buffer.from(jsonBody),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json({ success: true, resource }, { status: 200 });

    } catch (err) {
        console.error("Kaynak edit hatası:", err);
        return NextResponse.json({ error: "Düzenleme sırasında hata oluştu." }, { status: 500 });
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
