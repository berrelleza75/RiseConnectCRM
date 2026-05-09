const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getMessageStats = async () => {
    const res = await fetch(`${API_URL}/messages/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const markAsRead = async (contactId) => {
    await fetch(`${API_URL}/messages/read/${contactId}`, { method: 'PUT' });
};

export const getContactMessages = async (contactId, channel) => {
    const url = channel
        ? `${API_URL}/messages/contact/${contactId}?channel=${channel}`
        : `${API_URL}/messages/contact/${contactId}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const sendSms = async ({ contact_id, to, body, office_id, created_by }) => {
    const res = await fetch(`${API_URL}/messages/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id, to, body, office_id, created_by }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const sendEmail = async ({ contact_id, to, subject, body, office_id, created_by }) => {
    const res = await fetch(`${API_URL}/messages/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id, to, subject, body, office_id, created_by }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};
