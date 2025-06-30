// app/api/get-reports/route.js

import { metaClient } from "@/app/lib/r2";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

// Sadece meta bucket'ı kullanıyoruz!
const BUCKET = process.env.R2_META_BUCKET;

export async function GET() {
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: "reports/",
        });

        const listRes = await metaClient.send(listCommand);
        const reportFiles = listRes.Contents?.filter(obj => obj.Key.endsWith('.json')) || [];

        const reports = [];
        for (const file of reportFiles) {
            const getCommand = new GetObjectCommand({
                Bucket: BUCKET,
                Key: file.Key,
            });

            const { Body } = await metaClient.send(getCommand);
            const text = await streamToString(Body);
            const data = JSON.parse(text);
            reports.push(data);
        }

        return new Response(JSON.stringify({ reports }), { status: 200 });

    } catch (err) {
        console.error("Get reports error:", err);
        return new Response(JSON.stringify({ error: "Sunucu hatası" }), { status: 500 });
    }
}

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}
