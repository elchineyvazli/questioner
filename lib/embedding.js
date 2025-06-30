// lib/embedding.js
import OpenAI from 'openai';

const USE_OPENAI = process.env.USE_OPENAI_EMBEDDING === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let localEmbedder = null;

async function getLocalEmbedder() {
    if (!localEmbedder) {
        const { pipeline } = await import('@xenova/transformers');
        localEmbedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return localEmbedder;
}

export async function getEmbedding(text) {
    if (USE_OPENAI) {
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } else {
        const embedder = await getLocalEmbedder();
        const output = await embedder(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}
