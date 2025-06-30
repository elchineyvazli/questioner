import { NextResponse } from "next/server";
import { pdfClient } from "@/app/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const PDF_BUCKET = process.env.R2_PDF_BUCKET;
const RESOURCES_JSON_KEY = "resources.json";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const filterTag = searchParams.get("tag");
        const filterStatus = searchParams.get("status"); // şimdilik desteklenmiyor ama geleceğe hazırlık

        let resourcesArr = [];
        try {
            const { Body } = await pdfClient.send(new GetObjectCommand({
                Bucket: PDF_BUCKET,
                Key: RESOURCES_JSON_KEY,
            }));
            const jsonStr = await streamToString(Body);
            resourcesArr = JSON.parse(jsonStr);
            if (!Array.isArray(resourcesArr)) resourcesArr = [];
        } catch {
            resourcesArr = [];
        }

        // Etiket filtresi (örn: ?tag=Felsefe)
        if (filterTag) {
            resourcesArr = resourcesArr.filter(r =>
                Array.isArray(r.tags) && r.tags.includes(filterTag)
            );
        }

        // Status filtresi (gelecekte badge'e göre çalışabilir)
        if (filterStatus === "approved") {
            resourcesArr = resourcesArr.filter(r =>
                Array.isArray(r.badges) && r.badges.includes("AI tarafından onaylandı")
            );
        }

        // Sırala (en yeni en önce)
        resourcesArr.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        return NextResponse.json({ resources: resourcesArr }, { status: 200 });

    } catch (err) {
        console.error("Resource listeleme hatası:", err);
        return NextResponse.json({ error: "Kaynaklar yüklenemedi." }, { status: 500 });
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
