const API_URL = "http://localhost:5050/api/vault";



// Get all files of authenticated user
export async function getFiles() {

    const response = await fetch(
        API_URL,
        {
            credentials: "include"
        }
    );

    return response.json();

}





// Upload file for authenticated user
export async function uploadFile(file) {

    const formData = new FormData();

    formData.append(
        "file",
        file
    );


    const response = await fetch(
        API_URL,
        {
            method: "POST",

            credentials: "include",

            body: formData
        }
    );


    const data = await response.json();


    return {
        ok: response.ok,
        status: response.status,
        data
    };

}






// Update display name
export async function updateFileName(id, display_name) {


    const response = await fetch(

        `${API_URL}/${id}`,

        {
            method: "PUT",

            credentials: "include",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                display_name
            })

        }

    );



    const data = await response.json();



    if (!response.ok) {

        throw new Error(
            data.message || "Rename failed"
        );

    }



    return data;

}




// Delete file
export async function deleteFile(id) {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE",

            credentials: "include"
        }
    );


    return response.json();

}