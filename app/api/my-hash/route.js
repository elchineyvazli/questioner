// app/api/my-hash/route.js

import { NextResponse } from "next/server";
import { hashIp } from "@/app/lib/ipHash"; // alias ile sadeleştirildi

export async function GET(req) {
    // Gerçek IP tespiti
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-real-ip") ||
        "0.0.0.0";

    const hash = await hashIp(ip);

    return NextResponse.json({ hash });
}
