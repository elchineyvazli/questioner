// app/api/check-crypto-donations/route.js
import { NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { getRecentTransfers } from "@/app/lib/cryptoWallet";

// AWS S3/R2 Client (singleton pattern)
let s3Client = null;

function getS3Client() {
    if (!s3Client) {
        s3Client = new S3Client({
            region: "auto",
            endpoint: process.env.R2_META_ENDPOINT,
            credentials: {
                accessKeyId: process.env.R2_META_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_META_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
}

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const r2 = getS3Client();
        const BUCKET = process.env.R2_META_BUCKET;

        const [listRes, supporters] = await Promise.all([
            r2.send(new ListObjectsV2Command({
                Bucket: BUCKET,
                Prefix: "crypto-pending/"
            })),
            loadSupporters(r2, BUCKET)
        ]);

        const processingResults = await processDonations(
            r2,
            listRes.Contents || [],
            supporters,
            BUCKET
        );

        return NextResponse.json({
            status: "ok",
            confirmed: processingResults.filter(Boolean).length
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Yardımcı fonksiyonlar
async function processDonations(r2, pendingFiles, supporters, bucket) {
    const transfers = await getRecentTransfers("TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj", {
        min_block_timestamp: Date.now() - 86400000
    });

    return Promise.allSettled(
        pendingFiles.map(async (file) => {
            try {
                const obj = await r2.send(new GetObjectCommand({
                    Bucket: bucket,
                    Key: file.Key
                }));

                const donation = JSON.parse(await streamToBuffer(obj.Body));
                const found = findMatchingTransfer(transfers, donation);

                if (!found) return null;

                await moveToSuccess(r2, bucket, file.Key, donation, found);
                return donation;
            } catch (error) {
                console.error(`Processing error for ${file.Key}:`, error);
                return null;
            }
        })
    );
}

function findMatchingTransfer(transfers, donation) {
    return transfers.find(ev => (
        ev.result.to === process.env.DONATION_WALLET_ADDRESS &&
        parseFloat(ev.result.value) / 1e6 >= donation.amount
    ));
}

async function moveToSuccess(r2, bucket, fileKey, donation, transfer) {
    const newKey = fileKey.replace("crypto-pending/", "crypto-success/");

    await Promise.all([
        r2.send(new PutObjectCommand({
            Bucket: bucket,
            Key: newKey,
            Body: JSON.stringify({
                ...donation,
                txid: transfer.transaction_id
            }, null, 2),
            ContentType: "application/json"
        })),
        r2.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: fileKey
        }))
    ]);
}

async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

async function loadSupporters(r2, bucket) {
    try {
        const res = await r2.send(
            new GetObjectCommand({
                Bucket: bucket,
                Key: "supporters.json"
            })
        );
        return JSON.parse(await streamToBuffer(res.Body));
    } catch (error) {
        return [];
    }
}