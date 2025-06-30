import { NextResponse } from "next/server";
import { pdfClient } from "@/app/lib/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getEmbedding } from "@/app/lib/embedding";

const RESOURCES_JSON_KEY = "resources.json";
const VECTORS_JSON_KEY = "resource_vectors.json";

export async function POST(req) {
    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "ID zorunludur." }, { status: 400 });

        // Kaynakları al (pdf bucket!)
        const { Body: resBody } = await pdfClient.send(new GetObjectCommand({
            Bucket: process.env.R2_PDF_BUCKET,
            Key: RESOURCES_JSON_KEY,
        }));
        const resources = JSON.parse(await streamToString(resBody));
        const resource = resources.find(r => r.id === id);
        if (!resource) return NextResponse.json({ error: "Kaynak bulunamadı." }, { status: 404 });

        // Embedlenecek metin
        const text = [
            resource.name || resource.title || "",
            resource.description || "",
            (resource.tags || []).join(", "),
        ].join("\n");

        const vector = await getEmbedding(text);

        // Eski vektörleri al (pdf bucket!)
        let vectors = [];
        try {
            const { Body: vecBody } = await pdfClient.send(new GetObjectCommand({
                Bucket: process.env.R2_PDF_BUCKET,
                Key: VECTORS_JSON_KEY,
            }));
            vectors = JSON.parse(await streamToString(vecBody));
            if (!Array.isArray(vectors)) vectors = [];
        } catch (e) {
            vectors = [];
        }

        // Güncelle
        vectors = vectors.filter(v => v.id !== id);
        vectors.push({ id, embedding: vector, source: text });

        // Kaydet (pdf bucket!)
        await pdfClient.send(new PutObjectCommand({
            Bucket: process.env.R2_PDF_BUCKET,
            Key: VECTORS_JSON_KEY,
            Body: JSON.stringify(vectors, null, 2),
            ContentType: "application/json",
            ACL: "public-read",
        }));

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("Embed Resource Error:", err);
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}

// S3 stream to string
async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
