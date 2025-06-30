// next.config.js
module.exports = {
  // Eski yöntem (Next.js 14 ve öncesi)
  // api: { bodyParser: false } // ❌ ARTIK GEÇERLİ DEĞİL
  
  // Yeni yöntem (Next.js 15+)
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  }
}