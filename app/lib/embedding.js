// app/lib/embedding.js

let localEmbedder = null;
const USE_OPENAI = process.env.USE_OPENAI_EMBEDDING === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function getEmbedding(text) {
    // OPENAI: API KEY ve ayarı varsa OpenAI ile
    if (USE_OPENAI && OPENAI_API_KEY) {
        // Lazy load OpenAI
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } else {
        // Yerli model (transformers.js) ile
        if (!localEmbedder) {
            try {
                const { pipeline } = await import('@xenova/transformers');
                localEmbedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            } catch (e) {
                throw new Error("Yerli embedding modeli yüklenemedi: " + e?.message || e);
            }
        }
        const output = await localEmbedder(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}
