const API_URL = "http://localhost:5050/api/itinerary";


export async function generateItinerary(answers) {

    const response = await fetch(
        `${API_URL}/generate`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ answers })
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to generate itinerary");
    }

    return response.json();

}



export async function getDraftItinerary() {

    const response = await fetch(
        `${API_URL}/draft`,
        {
            credentials: "include"
        }
    );

    if (!response.ok) {
        return null;
    }

    return response.json();

}



export async function discardDraftItinerary() {

    const response = await fetch(
        `${API_URL}/draft`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );

    return response.json().catch(() => ({}));

}
