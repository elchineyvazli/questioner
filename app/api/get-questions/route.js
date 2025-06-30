// app/api/get-questions/route.js

import { metaClient } from "@/app/lib/r2";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

// Yardımcı: stream'i string'e çevir
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
}

export async function GET() {
    try {
        // 1. Soruları listele
        const listResult = await metaClient.send(new ListObjectsV2Command({
            Bucket: process.env.R2_META_BUCKET,
            Prefix: 'questions/',
        }));
        const files = listResult.Contents || [];

        // 2. Raporları (report) tara
        const reportList = await metaClient.send(new ListObjectsV2Command({
            Bucket: process.env.R2_META_BUCKET,
            Prefix: 'reports/',
        }));
        const reportCounts = {};
        for (const rep of reportList.Contents || []) {
            const repObj = await metaClient.send(new GetObjectCommand({
                Bucket: process.env.R2_META_BUCKET,
                Key: rep.Key,
            }));
            const repBody = await streamToString(repObj.Body);
            const repData = JSON.parse(repBody);
            const qid = repData.question_id;
            reportCounts[qid] = (reportCounts[qid] || 0) + 1;
        }

        // 3. Cevapları (answers) tara
        const answersList = await metaClient.send(new ListObjectsV2Command({
            Bucket: process.env.R2_META_BUCKET,
            Prefix: 'answers/',
        }));
        const allAnswers = [];
        for (const a of answersList.Contents || []) {
            if (!a.Key.endsWith('.json')) continue;
            const ansObj = await metaClient.send(new GetObjectCommand({
                Bucket: process.env.R2_META_BUCKET,
                Key: a.Key,
            }));
            const ansBody = await streamToString(ansObj.Body);
            try {
                const ansData = JSON.parse(ansBody);
                allAnswers.push(ansData);
            } catch { }
        }

        const now = Date.now();
        const DAY_MS = 24 * 60 * 60 * 1000;

        const questions = [];

        for (const file of files) {
            if (!file.Key.endsWith('.json')) continue;

            const getCommand = new GetObjectCommand({
                Bucket: process.env.R2_META_BUCKET,
                Key: file.Key,
            });

            const object = await metaClient.send(getCommand);
            const body = await streamToString(object.Body);

            try {
                const data = JSON.parse(body);

                // 3+ şikayet varsa gösterme
                if ((reportCounts[data.id] || 0) >= 3) continue;

                // votes (beğeni) -- UP/DOWN ayrı toplanır
                const [upList, downList] = await Promise.all([
                    metaClient.send(new ListObjectsV2Command({
                        Bucket: process.env.R2_META_BUCKET,
                        Prefix: `votes/question-${data.id}-up-`
                    })),
                    metaClient.send(new ListObjectsV2Command({
                        Bucket: process.env.R2_META_BUCKET,
                        Prefix: `votes/question-${data.id}-down-`
                    })),
                ]);
                const upvotes = (upList.Contents || []).length;
                const downvotes = (downList.Contents || []).length;
                const votes = upvotes - downvotes; // Net oy

                // answers (cevaplar)
                const answers = allAnswers.filter(ans => ans.question_id === data.id);
                const answerCount = answers.length;

                // Trend/Yükselen Algoritması:
                // - isTrending: 5+ beğeni veya 2+ cevap veya son 24 saatte beğeni/cevap
                // - isRising: Son 24 saatte 1+ yeni cevap
                const last24h = now - DAY_MS;

                let recentAnswer = answers.find(ans => new Date(ans.created_at).getTime() > last24h);
                let isTrending = false;
                let isRising = false;

                if (
                    votes >= 5 ||
                    answerCount >= 2 ||
                    answers.some(ans => new Date(ans.created_at).getTime() > last24h)
                ) {
                    isTrending = true;
                }
                if (recentAnswer) isRising = true;

                let badges = [];
                // AI-starred örnek (AI logic ile geliştirilebilir)
                if (data.id.endsWith('2') || data.id.endsWith('7')) {
                    badges.push('ai-starred');
                }
                // Hot: İlk 2 saatte çok yanıt/oy
                const TWO_HOUR_MS = 2 * 60 * 60 * 1000;
                const createdAtMs = new Date(data.created_at).getTime();
                if (
                    (now - createdAtMs <= TWO_HOUR_MS) &&
                    (answerCount >= 2 || votes >= 5)
                ) {
                    badges.push('hot');
                }
                // Doğrulanmış kaynak badge'i
                if (answers.some(a => a.source)) {
                    badges.push('verified-source');
                }
                // Trend badge'i
                if (isTrending) {
                    badges.push('trend');
                }
                questions.push({
                    ...data,
                    votes,
                    answerCount,
                    isTrending,
                    isRising,
                    badges,
                });
            } catch (e) {
                console.warn(`Geçersiz JSON at: ${file.Key}`);
            }
        }

        // Yeni → eski sırala
        questions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return new Response(JSON.stringify({ questions: questions || [] }), { status: 200 });
    } catch (err) {
        console.error('Get Questions Error:', err);
        return new Response(JSON.stringify({ error: 'Sunucu hatası' }), { status: 500 });
    }
}
