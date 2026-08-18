const API = "http://localhost:5050/api/travel-buddies";


export const sendTravelBuddyRequest = async (buddyUid) => {

    const res = await fetch(`${API}/request`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ buddyUid })
    });


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to send travel buddy request"
        );
    }


    return data;
};



export const getTravelBuddies = async () => {

    const res = await fetch(`${API}`, {
        credentials: "include"
    });


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to load travel buddies"
        );
    }


    return data;

};



export const getTravelBuddyRequests = async () => {

    const res = await fetch(`${API}/requests`, {
        credentials: "include"
    });


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to load travel buddy requests"
        );
    }


    return data;

};



export const acceptTravelBuddyRequest = async (id) => {

    const res = await fetch(
        `${API}/requests/${id}/accept`,
        {
            method: "PUT",
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to accept travel buddy request"
        );
    }


    return data;

};



export const rejectTravelBuddyRequest = async (id) => {

    const res = await fetch(
        `${API}/requests/${id}/reject`,
        {
            method: "PUT",
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to reject travel buddy request"
        );
    }


    return data;

};



export const removeTravelBuddy = async (id) => {

    const res = await fetch(
        `${API}/${id}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to remove travel buddy"
        );
    }


    return data;

};



export const searchTravelBuddyUsers = async (username) => {

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