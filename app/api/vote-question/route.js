// app/api/vote-question/route.js
import {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { hashIp } from "@/app/lib/ipHash";

const r2 = new S3Client({
    region: process.env.R2_META_REGION,
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.R2_META_BUCKET;

function getClientIp(headers) {
    return (
        headers.get("x-real-ip") ||
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "0.0.0.0"
    );
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("id");
    if (!questionId)
        return NextResponse.json({ error: "Eksik questionId" }, { status: 400 });

    const iphash = await hashIp(getClientIp(req.headers));

    const [upList, downList] = await Promise.all([
        r2.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: `votes/question-${questionId}-up-`,
        })),
        r2.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: `votes/question-${questionId}-down-`,
        })),
    ]);

    const upvotes = (upList.Contents || []).filter(f => f.Key.endsWith(".json")).length;
    const downvotes = (downList.Contents || []).filter(f => f.Key.endsWith(".json")).length;

    const myVote = upList.Contents?.some(f => f.Key.endsWith(`-up-${iphash}.json`)) ? 1 :
        downList.Contents?.some(f => f.Key.endsWith(`-down-${iphash}.json`)) ? -1 : 0;

    return NextResponse.json({
        upvotes,
        downvotes,
        totalVotes: upvotes - downvotes,
        myVote,
    }, { status: 200 });
}

export async function POST(req) {
    try {
        const { questionId, vote } = await req.json();
        if (!questionId || typeof vote !== "number") {
            return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
        }

        const iphash = await hashIp(getClientIp(req.headers));

        const upKey = `votes/question-${questionId}-up-${iphash}.json`;
        const downKey = `votes/question-${questionId}-down-${iphash}.json`;

        const deleteKeys = [upKey, downKey];

        await Promise.all(deleteKeys.map(key =>
            r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })).catch(() => { })
        ));

        const nowStr = new Date().toISOString();
        const voteBody = JSON.stringify({ questionId, voted_at: nowStr, vote, iphash });

        let newKey = null;
        if (vote === 1) newKey = upKey;
        else if (vote === -1) newKey = downKey;

        if (newKey) {
            await r2.send(new PutObjectCommand({
                Bucket: BUCKET,
                Key: newKey,
                Body: voteBody,
                ContentType: "application/json",
            }));
        }

        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (err) {
        console.error("Vote Question Error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
