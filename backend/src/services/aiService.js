const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

class SanjeevniAI {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
                                  "Identify critical risks immediately." +
                                  "Reply in max 30 word paragraph, plain text, no md, no bold, no italic, no bullet points, etc.";
            
            // Combine system context with the immediate user input
            const fullPrompt = `${systemContext}\n\nPatient Condition: ${userInput}`;

            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            });
            
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
