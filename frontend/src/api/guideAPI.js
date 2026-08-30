const API_URL = "http://localhost:5050/api/guides";


export async function getGuides(){

    const response = await fetch(
        API_URL,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function getGuide(id){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function createGuide(guide){

    const response = await fetch(
        API_URL,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(guide)
        }
    );

    return response.json();

}



export async function updateGuide(id,guide){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(guide)
        }
    );

    return response.json();

}



export async function deleteGuide(id){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

}



export async function bookGuide(id,booking){

    const response = await fetch(
        `${API_URL}/${id}/book`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(booking)
        }
    );

    return response.json();

}



export async function getMyBookings(){

    const response = await fetch(
        `${API_URL}/bookings/mine`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function cancelBooking(bookingId){

    const response = await fetch(
        `${API_URL}/bookings/${bookingId}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

} 


export async function getGuideReviews(id){

    const response = await fetch(
        `${API_URL}/${id}/reviews`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function getAllGuideRatings(){

    const response = await fetch(
        `${API_URL}/ratings/all`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function submitGuideReview(id,review){

    const response = await fetch(
        `${API_URL}/${id}/reviews`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(review)
        }
    );

    return response.json();

}



export async function deleteGuideReview(reviewId){

    const response = await fetch(
        `${API_URL}/reviews/${reviewId}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

} 