const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const Service = require("../models/Service");

exports.getAIChatResponse = asyncHandler(async (req, res, next) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return sendResponse(res, 400, false, "Messages array is required", null);
    }

    try {
        // 1. Fetch active salon services to inject into system prompt
        const services = await Service.find({ isActive: true });
        const serviceListStr = services
            .map((s) => `- ${s.name} (Category: ${s.category}, Price: ₹${s.price}, Duration: ${s.duration} mins, ID: ${s._id}) - ${s.description || "No description"}`)
            .join("\n");

        // 2. Build the system prompt
        const systemPrompt = `You are the Gayatri Beauty Studio AI Consultant, a luxurious beauty assistant. 
You address customers warmly with names like "Queen" or "Gorgeous".
You help clients with skincare recommendations, hair routines, makeup advice, and general salon questions.
You must recommend actual treatments from our studio when relevant. Below is the list of our available services:

${serviceListStr}

CRITICAL RULES:
1. When recommending a service, always format it as a markdown link with this exact pattern: [Service Name](service-id:SERVICE_ID) so the system can render a booking button. Example: "I recommend our [Hydrating Facial](service-id:66cfc72...). It will leave your skin glowing!"
2. Make your answers concise, luxurious, and supportive.
3. If a service is not related, do not make up services. Only recommend from the list above.`;

        // 3. Format messages for Groq completion API
        const groqMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content
            }))
        ];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.GROQ_STREAM_MODEL || "llama-3.1-8b-instant",
                messages: groqMessages,
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Groq API error: ${response.statusText} - ${errBody}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        sendResponse(res, 200, true, "AI response retrieved successfully", { reply });
    } catch (err) {
        console.error("AI Consultant chat error:", err);
        next(err);
    }
});
