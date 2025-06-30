// app/scripts/embed-resources.js
const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
require('dotenv').config({ path: '.env.local' });

const USE_OPENAI = process.env.USE_OPENAI_EMBEDDING === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// --- Embedding Fonksiyonu ---
async function getEmbedding(text) {
    if (USE_OPENAI && OPENAI_API_KEY) {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } else {
        // Yerli model
        const { pipeline } = await import('@xenova/transformers');
        const localEmbedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const output = await localEmbedder(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

// --- PDF'den metin çıkarma ve özetleme ---
async function getPDFText(pdfUrl) {
    try {
        // Klasik local dosya ise:
        if (pdfUrl.startsWith('http')) {
            // URL'den dosya indir (node-fetch gerekli)
            const fetch = (await import('node-fetch')).default;
            const res = await fetch(pdfUrl);
            if (!res.ok) return '';
            const arrayBuffer = await res.arrayBuffer();
            const data = await pdfParse(Buffer.from(arrayBuffer));
            return data.text || '';
        } else {
            // Local dosya ise:
            const data = await pdfParse(await fs.readFile(pdfUrl));
            return data.text || '';
        }
    } catch {
        return '';
    }
}

function smartExcerpt(text) {
    if (!text) return '';
    const total = text.length;
    if (total < 1200) return text;
    return (
        text.slice(0, 300) +
        ' ... ' +
        text.slice(Math.floor(total / 2), Math.floor(total / 2) + 400) +
        ' ... ' +
        text.slice(-300)
    );
}

async function main() {
    const resources = JSON.parse(await fs.readFile('app/scripts/resources.json', 'utf-8'));
    const vectors = [];
    for (const r of resources) {
        // --- PDF özet metni ekle ---
        let baseText = r.name || r.title || '';
        if (r.pdfUrl || r.fileUrl) {
            const text = await getPDFText(r.pdfUrl || r.fileUrl);
            baseText += '\n' + smartExcerpt(text);
        }
        const embedding = await getEmbedding(baseText);
        vectors.push({
            id: r.id,
            embedding
        });
        console.log(`[OK] ${r.name || r.title} -> vektör üretildi`);
    }
    await fs.writeFile('./resource_vectors.json', JSON.stringify(vectors, null, 2), 'utf-8');
    console.log('resource_vectors.json oluşturuldu!');
}

main();
