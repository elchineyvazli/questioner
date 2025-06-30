// app/lib/aiFallback.js
import aiProviders from "../../ai-provider.config.js";
import axios from "axios";

// Ortak helper: Fallbacklı AI yanıtı döner
export async function aiFallback({ prompt, system = null }) {
  // ESModule/default import farkına göre ayarla:
  const providers = Array.isArray(aiProviders) ? aiProviders : aiProviders.providers;

  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    if (!p.enabled) continue;

    const apiKey = process.env[p.apiKeyEnv];
    if (!apiKey) continue;
    try {
      
      let result = null;
      if (p.name === "openrouter") {
        // OpenRouter: supports many models
        const payload = {
          model: p.model,
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt }
          ],
        };
        const res = await axios.post(p.url, payload, {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        result = res.data.choices?.[0]?.message?.content;
      }
      else if (p.name === "grog") {
        const payload = {
          model: p.model,
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt }
          ]
        };
        const res = await axios.post(p.url, payload, {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        result = res.data.choices?.[0]?.message?.content;
      }
      else if (p.name === "gemini") {
        const payload = {
          contents: [
            ...(system ? [{ role: "system", parts: [{ text: system }] }] : []),
            { role: "user", parts: [{ text: prompt }] }
          ]
        };
        const res = await axios.post(`${p.url}?key=${apiKey}`, payload);
        result = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      }
      if (result && typeof result === "string" && result.length > 0) {
        return result;
      }
    } catch (err) {
      continue;
    }
  }
  return "AI fallback: Hiçbir sağlayıcıdan cevap alınamadı.";
}
