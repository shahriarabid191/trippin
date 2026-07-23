const API_URL = "http://localhost:5050/api/gallery";


// Public, site-wide gallery (works for guests too)
export async function getPublicGallery() {

    const response = await fetch(
        `${API_URL}/public`,
        {
            credentials: "include"
        }
    );

    if (!response.ok) {
        return [];
    }

    return response.json();

}



// The signed-in user's own photos
export async function getMyGallery() {

    const response = await fetch(
        `${API_URL}/mine`,
        {
            credentials: "include"
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load your gallery");
    }

    return response.json();

}



// Upload a photo (multipart)
export async function uploadPhoto({ file, caption, isPublic }) {

    const form = new FormData();
    form.append("image", file);
    form.append("caption", caption || "");
    form.append("isPublic", isPublic ? "true" : "false");

    const response = await fetch(
        API_URL,
        {
            method: "POST",
            credentials: "include",
            body: form
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Upload failed");
    }

    return response.json();

}



// Toggle public/private for one of your photos
export async function setPhotoVisibility(id, isPublic) {

    const response = await fetch(
        `${API_URL}/${id}/visibility`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ isPublic })
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update visibility");
    }

    return response.json();

}



// Delete one of your photos
export async function deletePhoto(id) {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete photo");
    }

    return response.json();

}



// Heart / un-heart a photo. Returns { liked, likeCount }.
export async function toggleLike(id) {

    const response = await fetch(
        `${API_URL}/${id}/like`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to react");
    }

    return response.json();

}
