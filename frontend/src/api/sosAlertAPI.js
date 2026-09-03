const API = "http://localhost:5050/api/sos-alerts";


// Trigger SOS alert
export const triggerSosAlert = async (data) => {

    const res = await fetch(
        API,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );


    const result = await res.json();


    if (!res.ok) {
        throw new Error(
            result.error || "Failed to trigger SOS alert"
        );
    }


    return result;

};


// Get alerts received by logged-in user
export const getReceivedAlerts = async () => {

    const res = await fetch(
        `${API}/received`,
        {
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to load received SOS alerts"
        );
    }


    return data;

};


// Get alerts sent by logged-in user
export const getSentAlerts = async () => {

    const res = await fetch(
        `${API}/sent`,
        {
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to load sent SOS alerts"
        );
    }


    return data;

};


// Acknowledge SOS alert
export const acknowledgeAlert = async (id) => {

    const res = await fetch(
        `${API}/${id}/ack`,
        {
            method: "PUT",
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to acknowledge SOS alert"
        );
    }


    return data;

};

