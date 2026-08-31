const API_URL = "http://localhost:5050/api/sim-shops";

export async function getShops(params = {}) {
    const query = new URLSearchParams();
    if (params.district) query.append("district", params.district);
    if (params.area) query.append("area", params.area);
    if (params.esim !== undefined) query.append("esim", params.esim);
    if (params.search) query.append("search", params.search);

    const response = await fetch(`${API_URL}?${query.toString()}`, {
        credentials: "omit"
    });
    if (!response.ok) throw new Error("Failed to fetch shops");
    return response.json();
}

export async function getMeta() {
    const response = await fetch(`${API_URL}/meta`, {
        credentials: "omit"
    });
    if (!response.ok) throw new Error("Failed to fetch meta");
    return response.json();
}

export async function submitShop(formData) {
    const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        body: formData, // FormData because of file upload
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to submit shop");
    }
    return response.json();
}

export async function updateShop(id, formData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData, // FormData because of file upload
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update shop");
    }
    return response.json();
}

export async function getMySubmissions() {
    const response = await fetch(`${API_URL}/mine`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to fetch my submissions");
    return response.json();
}

export async function withdrawSubmission(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to withdraw submission");
    return response.json();
}
