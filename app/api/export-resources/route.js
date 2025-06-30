// app/api/export-resources/route.js

import { NextResponse } from "next/server";
import { pdfClient } from "../../../app/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const RESOURCES_JSON_KEY = "resources.json";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "json").toLowerCase();
    const status = searchParams.get("status") || "approved";

    let resourcesArr = [];
    try {
        const { Body } = await pdfClient.send(new GetObjectCommand({
            Bucket: process.env.R2_PDF_BUCKET,
            Key: RESOURCES_JSON_KEY,
        }));
        const jsonStr = await streamToString(Body);
        resourcesArr = JSON.parse(jsonStr);
        if (!Array.isArray(resourcesArr)) resourcesArr = [];
    } catch {
        resourcesArr = [];
    }

    // Yalnızca belirli statüde olanlar (opsiyonel)
    resourcesArr = resourcesArr.filter(r => (r.status || "approved") === status);

    if (format === "csv") {
        const csv = arrayToCSV(resourcesArr);
        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="resources_${status}.csv"`,
            },
        });
    } else {
        // Default JSON
        return NextResponse.json(resourcesArr, {
            status: 200,
            headers: {
                "Content-Disposition": `attachment; filename="resources_${status}.json"`,
            },
        });
    }
}

// Helpers

async function streamToString(stream) {
    if (stream instanceof Buffer) return stream.toString();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

function arrayToCSV(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return "";
    // Sadece ana alanlar (kapsamı daralt!)
    const keys = ["id", "title", "description", "url", "pdfUrl", "tags", "status", "createdAt"];
    const escape = v =>
        typeof v === "string"
            ? `"${v.replace(/"/g, '""').replace(/\n/g, " ")}"`
            : Array.isArray(v)
                ? `"${v.join("; ")}"`
                : v == null
                    ? ""
                    : `"${String(v)}"`;
    const lines = [
        keys.join(","),
        ...arr.map(obj =>
            keys.map(k => escape(obj[k])).join(",")
        ),
    ];
    return lines.join("\r\n");
}
