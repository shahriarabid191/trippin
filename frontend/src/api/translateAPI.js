const API_URL = "http://localhost:5050/api/translate";

// Upload an image and get back its detected language, original text, and
// English translation.
export async function translateImage(file) {

    const formData = new FormData();

    formData.append(
        "image",
        file
    );

    const response = await fetch(
        `${API_URL}/image`,
        {
            method: "POST",

            credentials: "include",

            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message || "Translation failed"
        );

    }

    return data;

}
