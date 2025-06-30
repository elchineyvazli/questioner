// app/lib/r2.js

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// --- PDF Bucket (dosya) için client ve parametreler ---
const R2_PDF_BUCKET = process.env.R2_PDF_BUCKET;
const R2_PDF_REGION = process.env.R2_PDF_REGION || "auto";
const R2_PDF_ACCESS_KEY_ID = process.env.R2_PDF_ACCESS_KEY_ID;
const R2_PDF_SECRET_ACCESS_KEY = process.env.R2_PDF_SECRET_ACCESS_KEY;
const R2_PDF_ENDPOINT = process.env.R2_PDF_ENDPOINT;

export const pdfClient = new S3Client({
    region: R2_PDF_REGION,
    endpoint: R2_PDF_ENDPOINT,
    credentials: {
        accessKeyId: R2_PDF_ACCESS_KEY_ID,
        secretAccessKey: R2_PDF_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true
});

export async function uploadPdfToR2({ key, body, contentType = "application/json" }) {
    const uploadParams = {
        Bucket: R2_PDF_BUCKET,
        Key: key,
        Body: typeof body === "string" ? body : JSON.stringify(body, null, 2),
        ContentType: contentType,
        ACL: "public-read",
    };
    await pdfClient.send(new PutObjectCommand(uploadParams));
    // Public (veya endpoint’teki) url’i dönmek için:
    return `${R2_PDF_ENDPOINT}/${R2_PDF_BUCKET}/${key}`;
}

// --- Pdf dosyası oku (ör: resources.json) ---
export async function uploadPDFToR2({ fileBuffer, filename, mimetype }) {
    const uploadParams = {
        Bucket: R2_PDF_BUCKET,
        Key: filename,
        Body: fileBuffer,
        ContentType: mimetype,
        ContentDisposition: 'attachment',
        ACL: 'public-read' // Bu satır kritik!
    };

    await pdfClient.send(new PutObjectCommand(uploadParams));

    // Public URL oluştur
    return `${process.env.R2_PUBLIC_URL || R2_PDF_ENDPOINT}/${filename}`;
}



export async function getFileUrl(filename, action = 'view', expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: R2_PDF_BUCKET,
        Key: filename,
        ResponseContentDisposition: action === 'download' 
            ? 'attachment' 
            : 'inline' // 👈 Kritik fark!
    });

    return await getSignedUrl(pdfClient, command, { 
        expiresIn,
        signableHeaders: new Set(['host'])
    });
}
