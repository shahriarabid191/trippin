const API = "http://localhost:5050/api/sos";


// Send SOS contact request
export const sendSosRequest = async (contactUid) => {

    const res = await fetch(
        `${API}/request`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contactUid
            })
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to send SOS request"
        );
    }


    return data;

};


// Get accepted SOS contacts
export const getSosContacts = async () => {

    const res = await fetch(
        `${API}/contacts`,
        {
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to load SOS contacts"
        );
    }


    return data;

};


// Get incoming SOS contact requests
export const getSosRequests = async () => {

    const res = await fetch(
        `${API}/requests`,
        {
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to load SOS requests"
        );
    }


    return data;

};


// Accept SOS contact request
export const acceptSosRequest = async (id) => {

    const res = await fetch(
        `${API}/request/${id}/accept`,
        {
            method: "PUT",
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to accept SOS request"
        );
    }


    return data;

};


// Reject SOS contact request
export const rejectSosRequest = async (id) => {

    const res = await fetch(
        `${API}/request/${id}/reject`,
        {
            method: "PUT",
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to reject SOS request"
        );
    }


    return data;

};


// Remove SOS contact
export const removeSosContact = async (id) => {

    const res = await fetch(
        `${API}/contacts/${id}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to remove SOS contact"
        );
    }


    return data;

};


// Search users
export const searchSosUsers = async (username) => {

    const res = await fetch(
        `${API}/search?username=${encodeURIComponent(username)}`,
        {
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to search users"
        );
    }


    return data;

};

