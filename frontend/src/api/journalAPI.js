const API_URL = "http://localhost:5050/api/journals";


export async function getJournals(){

    const response = await fetch(
        API_URL,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function getCommunityJournals(){

    const response = await fetch(
        `${API_URL}/public`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function createJournal(journal){

    const response = await fetch(
        API_URL,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(journal)
        }
    );

    return response.json();

}



export async function deleteJournal(id){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

}



export async function updateJournal(id,journal){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(journal)
        }
    );

    return response.json();

}