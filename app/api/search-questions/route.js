// app/api/search-questions/route.js
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

// .env.local ile tam uyum!
const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.R2_META_BUCKET;

// Helper: stream -> string
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf-8');
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = (searchParams.get('q') || '').trim().toLowerCase();

        if (!query || query.length < 2) {
            return new Response(JSON.stringify({ questions: [] }), { status: 200 });
        }

        const list = await r2.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: 'questions/',
        }));

        const files = (list.Contents || [])
            .filter(f => f.Key.endsWith('.json'))
            .slice(-200); // Son 200 dosya

        const results = [];

        for (const file of files) {
            const obj = await r2.send(new GetObjectCommand({
                Bucket: BUCKET,
                Key: file.Key,
            }));
            const data = JSON.parse(await streamToString(obj.Body));
            if (
                (typeof data.content === "string" && data.content.toLowerCase().includes(query)) ||
                (typeof data.category === "string" && data.category.toLowerCase().includes(query))
            ) {
                results.push(data);
                if (results.length >= 15) break;
            }
        }

        return new Response(JSON.stringify({ questions: results }), { status: 200 });
    } catch (err) {
        console.error('Search Error:', err);
        return new Response(JSON.stringify({ error: 'Sunucu hatası' }), { status: 500 });
    }
}
