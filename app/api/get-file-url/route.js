import { getFileUrl } from '@/app/lib/r2';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const action = searchParams.get('action') || 'view'; // 'view' veya 'download'

    if (!filename) {
        return NextResponse.json(
            { error: 'Filename parameter is required' },
            { status: 400 }
        );
    }

    try {
        const url = await getFileUrl(filename, action);
        return NextResponse.json({ url });
    } catch (err) {
        console.error('URL generation error:', err);
        return NextResponse.json(
            { error: 'Failed to generate URL' },
            { status: 500 }
        );
    }
}