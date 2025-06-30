// app/api/get-answers-list/route.js
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { metaClient } from "@/app/lib/r2";

// Yardımcı: stream'i string'e çevir
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf-8');
}

export async function GET() {
    try {
        // Sadece meta bucket'ı kullan!
        const list = await metaClient.send(new ListObjectsV2Command({
            Bucket: process.env.R2_META_BUCKET,
            Prefix: 'answers/',
        }));

        const files = (list.Contents || []).filter(f => f.Key.endsWith('.json')).slice(-200);

        const answers = [];
        for (const file of files) {
            const obj = await metaClient.send(new GetObjectCommand({
                Bucket: process.env.R2_META_BUCKET,
                Key: file.Key,
            }));
            const data = JSON.parse(await streamToString(obj.Body));
            answers.push(data);
        }
        answers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return new Response(JSON.stringify({ answers }), { status: 200 });
    } catch (err) {
        console.error('Get Answers List Error:', err);
        return new Response(JSON.stringify({ error: 'Sunucu hatası' }), { status: 500 });
    }
}
