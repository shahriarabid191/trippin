// Image translation controller — deliberately isolated from chatController.js:
// its own model constant and its own env var, so the two features can be
// pointed at different Gemini models without touching each other's code.
const GEMINI_TRANSLATE_MODEL = process.env.GEMINI_TRANSLATE_MODEL || "gemini-flash-latest";
const GEMINI_TRANSLATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TRANSLATE_MODEL}:generateContent`;

const PROMPT = `
You are an OCR + translation engine. Look at the attached image and find all
legible text in it (signage, menus, labels, handwriting, etc.), in whatever
language or script it appears in. Then translate that text into English.

Respond with the source language's name, the original text exactly as it
appears (preserving line breaks), and the English translation. If there is no
legible text in the image, set detected_language to "none" and leave the
other two fields as empty strings.
`.trim();

const RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        detected_language: { type: "STRING" },
        original_text: { type: "STRING" },
        translated_text: { type: "STRING" }
    },
    required: ["detected_language", "original_text", "translated_text"]
};

// POST /api/translate/image
export const translateImage = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "An image file is required"
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            message: "Translation service is not configured"
        });
    }

    try {

        const response = await fetch(`${GEMINI_TRANSLATE_URL}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                inlineData: {
                                    mimeType: req.file.mimetype,
                                    data: req.file.buffer.toString("base64")
                                }
                            },
                            { text: PROMPT }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                    responseSchema: RESPONSE_SCHEMA
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini translate API error:", data);
            return res.status(502).json({
                message: "Failed to reach translation service"
            });
        }

        const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("");

        let result;
        try {
            result = JSON.parse(raw);
        } catch (parseError) {
            console.error("Failed to parse translation response:", raw);
            return res.status(502).json({
                message: "Translation service returned an unreadable response"
            });
        }

        res.json({
            detectedLanguage: result.detected_language || "unknown",
            originalText: result.original_text || "",
            translatedText: result.translated_text || ""
        });

    } catch (error) {

        console.error("Translate error:", error);
        res.status(500).json({
            message: "Server error"
        });

    }

};
