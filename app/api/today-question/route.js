import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
} from "@aws-sdk/client-s3";

const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.R2_META_BUCKET;

// Yardımcı: stream to string
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
}

// Basit ama sabit bir tarih bazlı hash
function simpleHash(str, max) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % max;
    }
    return hash;
}

export async function GET() {
    try {
        // Tüm soruları getir
        const questionList = await r2.send(
            new ListObjectsV2Command({
                Bucket: BUCKET,
                Prefix: "questions/",
            })
        );
        const questionFiles = (questionList.Contents || []).filter(f =>
            f.Key.endsWith(".json")
        );

        if (!questionFiles.length) {
            return new Response(JSON.stringify({ question: null }), {
                status: 200,
            });
        }

        // Report verilerini topla (hatalı dosyaları yoksay)
        const reportCounts = {};
        try {
            const reportList = await r2.send(
                new ListObjectsV2Command({
                    Bucket: BUCKET,
                    Prefix: "reports/",
                })
            );

            for (const file of reportList.Contents || []) {
                if (!file.Key.endsWith(".json")) continue;
                try {
                    const obj = await r2.send(
                        new GetObjectCommand({
                            Bucket: BUCKET,
                            Key: file.Key,
                        })
                    );
                    const body = await streamToString(obj.Body);
                    const report = JSON.parse(body);
                    const qid = report?.question_id;
                    if (qid) {
                        reportCounts[qid] = (reportCounts[qid] || 0) + 1;
                    }
                } catch {
                    // bozuk dosya yoksay
                }
            }
        } catch {
            // hiç report olmayabilir
        }

        // Geçerli (3'ten az şikayetli) soruları ayıkla
        const validQuestions = [];
        for (const file of questionFiles) {
            try {
                const obj = await r2.send(
                    new GetObjectCommand({
                        Bucket: BUCKET,
                        Key: file.Key,
                    })
                );
                const body = await streamToString(obj.Body);
                const data = JSON.parse(body);
                if (!data?.id || typeof data.content !== "string") continue;
                if ((reportCounts[data.id] || 0) < 3) {
                    validQuestions.push(data);
                }
            } catch {
                // bozuk dosya yoksay
            }
        }

        if (!validQuestions.length) {
            return new Response(JSON.stringify({ question: null }), {
                status: 200,
            });
        }

        // Aynı gün aynı soru için sabit index
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const index = simpleHash(today, validQuestions.length);
        const todayQuestion = validQuestions[index];

        return new Response(JSON.stringify({ question: todayQuestion }), {
            status: 200,
        });
    } catch (err) {
        console.error("today-question error:", err);
        return new Response(JSON.stringify({ error: "Sunucu hatası" }), {
            status: 500,
        });
    }
}
