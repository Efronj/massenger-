const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function sendMessageToGemini(message, history = []) {
    if (!API_KEY) {
        console.error("API Key missing");
        return "API Key is not configured. Please check your .env file.";
    }

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    ...history.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    })),
                    {
                        role: 'user',
                        parts: [{ text: message }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "I encountered an error while processing your request. Please try again later.";
    }
}
