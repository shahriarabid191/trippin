const API = "http://localhost:5050/api/sos";


export const sendSosRequest = async (contactUid) => {

    const res = await fetch(`${API}/request`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ contactUid })
    });


    const data = await res.json();


    if (!res.ok) {
        throw new Error(
            data.error || "Failed to send SOS request"
        );
    }


    return data;
};



export const getSosContacts = async () => {

    const res = await fetch(`${API}/contacts`, {
        credentials: "include"
    });


    const data = await res.json();


    if(!res.ok){
        throw new Error(
            data.error || "Failed to load contacts"
        );
    }


    return data;

};



export const getSosRequests = async () => {

    const res = await fetch(`${API}/requests`, {
        credentials: "include"
    });


    const data = await res.json();


    if(!res.ok){
        throw new Error(
            data.error || "Failed to load requests"
        );
    }


    return data;

};



export const acceptSosRequest = async (id) => {

    const res = await fetch(
        `${API}/request/${id}/accept`,
        {
            method:"PUT",
            credentials:"include"
        }
    );


    const data = await res.json();


    if(!res.ok){
        throw new Error(
            data.error || "Failed to accept request"
        );
    }


    return data;

};



export const rejectSosRequest = async (id) => {

    const res = await fetch(
        `${API}/request/${id}/reject`,
        {
            method:"PUT",
            credentials:"include"
        }
    );


    const data = await res.json();


    if(!res.ok){
        throw new Error(
            data.error || "Failed to reject request"
        );
    }


    return data;

};