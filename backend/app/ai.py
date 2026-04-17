import google.generativeai as genai
import os

class SanjeevniAI:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None

    async def get_clinical_recommendation(self, symptoms: str, vitals: dict):
        """
        ALGORITHM TODO:
        1. Format the prompt with symptoms and vitals.
        2. Call Gemini API to get a structured recommendation.
        3. Parse the output for 'urgency' and 'suggested_resources'.
        """
        if not self.model:
            return {
                "recommendation": "Mock: High risk case. ICU transfer recommended.",
                "urgency": "high"
            }
        
        prompt = f"As a senior medical assistant, analyze: Symptoms: {symptoms}, Vitals: {vitals}. Suggest urgency and resources."
        response = self.model.generate_content(prompt)
        return {"recommendation": response.text, "urgency": "analyzed"}

ai_assistant = SanjeevniAI()
