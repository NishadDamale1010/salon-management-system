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

exports.parseBulkProducts = asyncHandler(async (req, res, next) => {
    const { rawText } = req.body;

    if (!rawText) {
        return sendResponse(res, 400, false, "Raw text is required", null);
    }

    try {
        const systemPrompt = `You are a strict data extraction AI. You will receive a messy string of text containing inventory products.
Extract each product and return ONLY a valid JSON array of objects.
EACH object MUST have these exact fields and matching types:
- name (String): Name of the product
- sku (String): A generated SKU like "AI-GEN-001" (make it unique)
- brand (String): The brand name if available, else "Generic"
- category (String): The product category (e.g. Hair Care, Skin Care)
- price (Number): Selling price in INR
- stockQuantity (Number): The quantity mentioned
- unit (String): E.g. "bottles", "tubes", "pieces", "jars". Default to "pieces" if unknown.

CRITICAL: Return ONLY valid JSON starting with [ and ending with ]. Do not include markdown code blocks, do not include any explanatory text.`;

        const groqMessages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: rawText }
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
                temperature: 0.1,
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Groq API error: ${response.statusText} - ${errBody}`);
        }

        const data = await response.json();
        let reply = data.choices[0].message.content.trim();

        // Remove markdown formatting if the AI ignores instructions
        if (reply.startsWith("\`\`\`json")) {
            reply = reply.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
        } else if (reply.startsWith("\`\`\`")) {
            reply = reply.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
        }

        const parsedProducts = JSON.parse(reply);

        sendResponse(res, 200, true, "Parsed successfully", parsedProducts);
    } catch (err) {
        console.error("AI Parse Products error:", err);
        return sendResponse(res, 500, false, "Failed to parse products. Ensure your text contains recognizable product details.", null);
    }
});
