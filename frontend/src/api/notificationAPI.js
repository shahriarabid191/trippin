const API_URL = "http://localhost:5050/api/notifications";


export async function getNotifications(){

    const response = await fetch(
        API_URL,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function getUnreadNotificationCount(){

    const response = await fetch(
        `${API_URL}/unread-count`,
        {
            credentials:"include"
        }
    );

    const data = await response.json();

    return data.count;

}



export async function markNotificationRead(id){

    const response = await fetch(
        `${API_URL}/${id}/read`,
        {
            method:"PATCH",
            credentials:"include"
        }
    );

    return response.json();

}

export async function markAllNotificationsRead() {

    const response = await fetch(
        `${API_URL}/read-all`,
        {
            method: "PATCH",
            credentials: "include"
        }
    );

    return response.json();

}