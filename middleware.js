import { NextResponse } from 'next/server';

export function middleware(request) {
    // Basit bir loglama veya IP koruma filtresi
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    console.log(`[Middleware] IP: ${ip} - ${request.nextUrl.pathname}`);

    return NextResponse.next();
}
