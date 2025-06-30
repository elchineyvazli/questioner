// app/api/get-badge-questions/route.js
import { NextResponse } from 'next/server';
import { getMetaFromR2 } from '@/app/lib/r2';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Rozet slug gerekli.' }, { status: 400 });
    }

    try {
        // questions.json artık meta bucket’ta, okuma fonksiyonu doğrudan json olarak döner!
        const questions = JSON.parse(await getMetaFromR2('questions.json'));

        const filtered = questions.filter(q =>
            Array.isArray(q.badges) && q.badges.includes(slug)
        );

        return NextResponse.json(filtered);
    } catch (err) {
        console.error('Rozetli soru alma hatası:', err);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}
