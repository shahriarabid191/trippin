const API_URL = "http://localhost:5050/api/todos";


export async function getTodos(){

    const response = await fetch(
        API_URL,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function createTodo(todo){

    const response = await fetch(
        API_URL,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(todo)
        }
    );

    return response.json();

}



export async function deleteTodo(id){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

}



export async function updateTodo(id,todo){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(todo)
        }
    );

    return response.json();

}