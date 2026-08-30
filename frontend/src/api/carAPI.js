const API_URL = "http://localhost:5050/api/cars";


export async function getCars(){

    const response = await fetch(
        API_URL,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function getCar(id){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function createCar(car){

    const response = await fetch(
        API_URL,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(car)
        }
    );

    return response.json();

}



export async function updateCar(id,car){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(car)
        }
    );

    return response.json();

}



export async function deleteCar(id){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

}



export async function bookCar(id,booking){

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


export async function getCarReviews(id){

    const response = await fetch(
        `${API_URL}/${id}/reviews`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function getAllCarRatings(){

    const response = await fetch(
        `${API_URL}/ratings/all`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function submitCarReview(id,review){

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



export async function deleteCarReview(reviewId){

    const response = await fetch(
        `${API_URL}/reviews/${reviewId}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

}