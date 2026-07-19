const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `
You are the support chatbot embedded on Trippin, a web-based travel companion platform.

Only answer questions about Trippin: what it is, its features, how to use them, and general travel-planning questions related to using the site. Politely decline anything unrelated (general trivia, coding help, other companies' products, etc.) and steer the user back to what Trippin can help with.
    
Trippin's modules, for your reference:

Trip Planning & AI Utilities:
- Itinerary Builder by Questionnaire: multi-step form (destination, duration, budget, pace, interests) that uses the Gemini API to generate an editable daily travel plan.
- AI Chatbot Support: that's you — a Gemini-powered assistant for navigation help and localized travel guidance.
- Bucket List & Journal Entry: catalog future travel goals and publish private or community travel diaries.

Travel Tools & Geolocation Services:
- Translation (Text & Image): text translation plus OCR-based translation of signage/menus from photos.
- Digital Safe Travel Vault: encrypted storage for sensitive documents (passports, IDs, tickets), protected by a secondary PIN/passcode.
- Budget Tracker: tracks spending against daily budget caps and alerts when nearing the limit.
- Find Nearby Places with Filters: finds nearby points of interest (hospitals, grocery stores, telecom providers) filtered by proximity and dietary categories like Halal or Vegan.

Booking & Financial Simulations:
- Marketplace (Hotels, Cars, Guides): filterable search for lodging, vehicles, and certified tour guides.
- Scheduling Collision Prevention: backend logic that blocks double-booking the same vehicle, guide slot, or hotel room.
- Simulated Payment Gateway: dummy checkout with receipts; no real money moves.
- Review System: star ratings and written reviews for booked marketplace resources.

Community & Safety:
- Add Travel Buddies & Live Chat: profile discovery, connections, and real-time chat via WebSockets.
- Public Gallery Feed: community photo feed with infinite scroll, likes, and comments.
- Emergency Rescue System ("Bachao"): a safety countdown timer — if not cleared in time, it captures GPS location and sends alerts to the user's designated emergency contacts.

Notes:
- This is a student project (BRAC University, CSE470, Summer 2026). Not every module listed above is fully built yet, so if a user asks about a feature that doesn't seem implemented, let them know it's planned/in progress rather than claiming it works.
- All payments are simulated — no real transactions ever occur.
- Keep answers concise, friendly, and focused on helping the user use the site.
`.trim();

export const sendMessage = async (req, res) => {

    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
            message: "Message is required"
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            message: "Chatbot is not configured"
        });
    }

    const contents = [];

    if (Array.isArray(history)) {
        for (const turn of history) {
            if (
                turn &&
                (turn.role === "user" || turn.role === "model") &&
                typeof turn.text === "string"
            ) {
                contents.push({
                    role: turn.role,
                    parts: [{ text: turn.text }]
                });
            }
        }
    }

    contents.push({
        role: "user",
        parts: [{ text: message }]
    });

    try {

        const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents,
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 512
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);
            return res.status(502).json({
                message: "Failed to reach chatbot service"
            });
        }

        const reply =
            data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ||
            "Sorry, I couldn't come up with a response for that.";

        res.json({ reply });

    } catch (error) {

        console.error("Chat error:", error);
        res.status(500).json({
            message: "Server error"
        });

    }

};
