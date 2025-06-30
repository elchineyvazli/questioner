import { aiFallback } from "./aiFallback";

export async function analyzeResourceWithAI({ text, language = "tr" }) {
    if (!text || text.trim().split(/\s+/).length < 5) {
        return { tags: ["Flagged"], summary: "", abuse: false };
    }

    const prompt = `
LÜTFEN SADECE JSON FORMATINDA CEVAP VERİN. BAŞKA HİÇBİR AÇIKLAMA EKLEMEYİN.
{
  "tags": ["..."],
  "summary": "Özet buraya",
  "abuse": true/false
}

Kaynak metni (kırpılmış hali):\n"""${text.slice(0, 6000)}"""
`.trim();

    let aiOut = null;
    try {
        const response = await aiFallback({ prompt });
        console.log("GELEN YANIT:", response);

        // 1. Markdown wrapper'ı temizle
        let cleanResponse = response;
        if (response.startsWith('```json')) {
            cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        // 2. JSON parse et
        aiOut = JSON.parse(cleanResponse);

        // 3. Geçerli bir obje mi kontrol et
        if (typeof aiOut === "object" && aiOut !== null) {
            return aiOut;
        }
        return { tags: ["Flagged"], summary: "", abuse: true };
    } catch (err) {
        console.error("AI yanıt parse hatası:", err);

        // 4. Hata durumunda manuel parse denemesi
        try {
            const jsonStart = response.indexOf('{');
            const jsonEnd = response.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const possibleJson = response.slice(jsonStart, jsonEnd);
                aiOut = JSON.parse(possibleJson);
                if (typeof aiOut === "object") return aiOut;
            }
        } catch (e) {
            console.error("Manuel parse denemesi başarısız:", e);
        }

        return { tags: ["Flagged"], summary: "", abuse: false };
    }
}