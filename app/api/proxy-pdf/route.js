import { NextResponse } from "next/server";

const ALLOWED_PREFIX = process.env.R2_PDF_ENDPOINT;

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const url = searchParams.get("url");
        const filenameRaw = searchParams.get("filename");
        const filename = sanitizeFilename(filenameRaw || "kaynak.pdf");

        // URL geçerliliği ve güvenlik kontrolü
        if (!url || !url.startsWith(ALLOWED_PREFIX)) {
            return NextResponse.json({ error: "Geçersiz veya izin verilmeyen PDF adresi." }, { status: 400 });
        }

        const pdfRes = await fetch(url);
        if (!pdfRes.ok) {
            return NextResponse.json({ error: "PDF indirilemedi." }, { status: 404 });
        }

        const contentType = pdfRes.headers.get("content-type") || "";
        if (!contentType.includes("pdf")) {
            return NextResponse.json({ error: "İndirilen içerik PDF değil." }, { status: 400 });
        }

        const arrayBuffer = await pdfRes.arrayBuffer();

        return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
                "Cache-Control": "no-store"
            }
        });
    } catch (e) {
        console.error("PDF proxy hatası:", e);
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}

function sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').slice(0, 100) || "dosya.pdf";
}
