// app/api/check-crypto-donations/route.js
import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import tron from "@/lib/cryptoWallet";

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
const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // Official USDT TRC20

export async function GET() {
    try {
        const listRes = await r2.send(
            new ListObjectsV2Command({ Bucket: BUCKET, Prefix: PENDING_PREFIX })
        );

        const pendingFiles = listRes.Contents || [];
        const supporters = await loadSupporters();
        const wallet = process.env.DONATION_WALLET_ADDRESS;

        const confirmed = [];

        for (const file of pendingFiles) {
            const id = file.Key.split("/")[1];
            const obj = await r2.send(
                new GetObjectCommand({ Bucket: BUCKET, Key: file.Key })
            );
            const donationStr = await streamToString(obj.Body);
            const donation = JSON.parse(donationStr);

            // İşlem kontrolü (basit eşleştirme - production için daha gelişmiş yapılmalı)
            const txList = await tron.trx.getContractEvents(USDT_CONTRACT, {
                eventName: "Transfer",
                size: 50
            });

            const found = txList.find(ev => {
                const { to, value } = ev.result;
                return (
                    to === wallet &&
                    parseFloat(value) / 1e6 >= donation.amount
                );
            });

            if (found) {
                confirmed.push(donation);

                // 1. Başarılı klasöre taşı
                await r2.send(
                    new PutObjectCommand({
                        Bucket: BUCKET,
                        Key: `${SUCCESS_PREFIX}${id}.json`,
                        Body: JSON.stringify({ ...donation, txid: found.transaction_id }, null, 2),
                        ContentType: "application/json"
                    })
                );

                // 2. Pending dosyasını sil
                await r2.send(
                    new DeleteObjectCommand({ Bucket: BUCKET, Key: file.Key })
                );

                // 3. Supporters.json'a ekle
                supporters.push({
                    nickname: donation.nickname,
                    message: donation.message,
                    amount: donation.amount,
                    createdAt: donation.createdAt,
                });
            }
        }

        // Güncellenmiş destekçi listesi kaydet
        await r2.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: SUPPORTERS_KEY,
                Body: JSON.stringify(supporters, null, 2),
                ContentType: "application/json"
            })
        );

        return NextResponse.json({ status: "ok", confirmed: confirmed.length });
    } catch (err) {
        console.error("Check crypto donations error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
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
