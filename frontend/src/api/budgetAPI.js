const API_URL = "http://localhost:5050/api/budgets";


export async function getBudgets(){

    const response = await fetch(
        API_URL,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function getBudget(id){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            credentials:"include"
        }
    );

    return response.json();

}



export async function createBudget(budget){

    const response = await fetch(
        API_URL,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(budget)
        }
    );

    return response.json();

}



export async function updateBudget(id,budget){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(budget)
        }
    );

    return response.json();

}



export async function deleteBudget(id){

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

}



export async function addExpense(budgetId,expense){

    const response = await fetch(
        `${API_URL}/${budgetId}/expenses`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify(expense)
        }
    );

    return response.json();

}



export async function deleteExpense(expenseId){

    const response = await fetch(
        `${API_URL}/expenses/${expenseId}`,
        {
            method:"DELETE",
            credentials:"include"
        }
    );

    return response.json();

} 