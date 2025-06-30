import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getRecentTransfers } from "@/app/lib/cryptoWallet";

const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_META_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_META_BUCKET;
const PENDING_PREFIX = "crypto-pending/";
const SUCCESS_PREFIX = "crypto-success/";
const SUPPORTERS_KEY = "supporters.json";
const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

export async function GET() {
    try {
        const [listRes, supporters] = await Promise.all([
            r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: PENDING_PREFIX })),
            loadSupporters()
        ]);

        const pendingFiles = listRes.Contents || [];
        const wallet = process.env.DONATION_WALLET_ADDRESS;
        const transfers = await getRecentTransfers(USDT_CONTRACT, {
            min_block_timestamp: Date.now() - 86400000
        });

        const processingResults = await Promise.allSettled(
            pendingFiles.map(async (file) => {
                const id = file.Key.split("/")[1];
                const obj = await r2.send(new GetObjectCommand({
                    Bucket: BUCKET,
                    Key: file.Key
                }));
                const donation = JSON.parse(await streamToString(obj.Body));

                const found = transfers.find(ev => {
                    const { to, value, block_timestamp } = ev.result;
                    return (
                        to === wallet &&
                        parseFloat(value) / 1e6 >= donation.amount
                    );
                });

                if (!found) return null;

                await Promise.all([
                    r2.send(new PutObjectCommand({
                        Bucket: BUCKET,
                        Key: `${SUCCESS_PREFIX}${id}.json`,
                        Body: JSON.stringify({
                            ...donation,
                            txid: found.transaction_id
                        }, null, 2),
                        ContentType: "application/json"
                    })),
                    r2.send(new DeleteObjectCommand({
                        Bucket: BUCKET,
                        Key: file.Key
                    }))
                ]);

                return donation;
            })
        );

        const confirmedDonations = processingResults
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);

        if (confirmedDonations.length > 0) {
            const updatedSupporters = [
                ...supporters,
                ...confirmedDonations.map(d => ({
                    nickname: d.nickname,
                    message: d.message,
                    amount: d.amount,
                    createdAt: d.createdAt,
                }))
            ];

            await r2.send(new PutObjectCommand({
                Bucket: BUCKET,
                Key: SUPPORTERS_KEY,
                Body: JSON.stringify(updatedSupporters, null, 2),
                ContentType: "application/json"
            }));
        }

        return NextResponse.json({
            status: "ok",
            confirmed: confirmedDonations.length
        });

    } catch (err) {
        console.error("Check crypto donations error:", {
            message: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        });
        return NextResponse.json({
            error: "Sunucu hatası",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        }, { status: 500 });
    }
}

function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on("data", chunk => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
}

async function loadSupporters() {
    try {
        const res = await r2.send(
            new GetObjectCommand({ Bucket: BUCKET, Key: SUPPORTERS_KEY })
        );
        const str = await streamToString(res.Body);
        return JSON.parse(str);
    } catch (err) {
        return [];
    }
}