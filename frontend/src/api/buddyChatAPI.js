const API = 'http://localhost:5050/api/buddy-chat';


/**
 * Fetch all messages in the conversation with a buddy.
 */
export async function getMessages(buddyId) {

    const res = await fetch(
        `${API}/${buddyId}/messages`,
        { credentials: 'include' }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || 'Failed to load messages — make sure the backend is running and the DB migration has been applied.');
    }

    return data.messages || [];

}


/**
 * Send a message to a buddy.
 */
export async function sendMessage(buddyId, body) {

    const res = await fetch(
        `${API}/${buddyId}/messages`,
        {
            method:      'POST',
            credentials: 'include',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify({ body })
        }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
    }

    return data.message;

}


/**
 * Toggle an emoji reaction on a message.
 */
export async function toggleReaction(messageId, emoji) {

    const res = await fetch(
        `${API}/messages/${messageId}/react`,
        {
            method:      'POST',
            credentials: 'include',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify({ emoji })
        }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || 'Failed to react to message');
    }

    return data;

}


/**
 * Get unread message counts grouped by sender.
 * Returns [{ sender_id, sender_username, unread_count, last_at }]
 */
export async function getUnreadChatMessages() {

    const res = await fetch(
        `${API}/unread`,
        { credentials: 'include' }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return [];

    return data.unread || [];

}
