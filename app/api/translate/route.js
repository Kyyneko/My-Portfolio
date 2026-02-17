import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { text, from = 'id', to = 'en' } = await request.json();

        if (!text || text.trim() === '') {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // Use MyMemory Translation API (free, no API key required)
        const encoded = encodeURIComponent(text);
        const langPair = `${from}|${to}`;
        const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${langPair}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return NextResponse.json({
                translated: data.responseData.translatedText,
                match: data.responseData.match,
            });
        }

        return NextResponse.json(
            { error: data.responseDetails || 'Translation failed' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: 'Translation service unavailable' }, { status: 500 });
    }
}
