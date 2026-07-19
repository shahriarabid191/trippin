const API_URL = "http://localhost:5050/api/chat";


export async function sendChatMessage(message, history) {

    const response = await fetch(
        API_URL,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ message, history })
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to reach chatbot");
    }

    return response.json();

}
