const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

class SanjeevniAI {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        } else {
            this.model = null;
        }
    }

    async getClinicalRecommendation(userInput, history = []) {
        if (!this.model) {
            return {
                recommendation: "AI model not initialized. (Mock: Stable case)",
                urgency: "mock"
            };
        }

        try {
            // System instruction to establish role
            const systemContext = "You are 'Sanjeevni AI', a senior medical clinical assistant. " + 
                                  "Provide concise, accurate clinical advice based on symptoms and vitals. " +
                                  "Identify critical risks immediately. Always suggest nearest ICU resources if vitals are unstable.";
            
            // Format history for Gemini (limited to last 15 messages as requested)
            const chatHistory = history.slice(-15).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            const chat = this.model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 500,
                },
            });

            const fullPrompt = history.length === 0 ? `${systemContext}\nPatient Info: ${userInput}` : userInput;

            const result = await chat.sendMessage(fullPrompt);
            const response = await result.response;
            const text = response.text();

            return {
                recommendation: text,
                urgency: text.toLowerCase().includes('critical') || text.toLowerCase().includes('emergency') ? 'critical' : 'stable'
            };
        } catch (error) {
            console.error("AI Service Error:", error);
            return {
                recommendation: "Error generating recommendation. Please check clinical protocols manually.",
                urgency: "error"
            };
        }
    }
}

module.exports = new SanjeevniAI();
