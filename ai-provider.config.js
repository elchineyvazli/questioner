// ai-provider.config.js
module.exports = {
    providers: [
        {
            name: "grog",
            type: "grog-cloud",
            apiKeyEnv: "GROG_API_KEY",
            model: "gemini-1.5-flash",
            url: "https://api.grogcloud.com/v1/chat/completions",
            enabled: true,
        },
        {
            name: "gemini",
            type: "google-gemini",
            apiKeyEnv: "GEMINI_API_KEY",
            model: "gemini-1.5-flash",
            url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            enabled: true,
        },
        {
            name: "openrouter",
            type: "openrouter",
            apiKeyEnv: "OPENROUTER_API_KEY",
            model: "mistralai/mistral-7b-instruct", // veya openrouter'dan istediğin model
            url: "https://openrouter.ai/api/v1/chat/completions",
            enabled: true,
        },
        // Daha fazla provider eklemek istersen buraya ekle!
    ]
};
