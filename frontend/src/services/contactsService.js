const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getContacts = async () => {
    const response = await fetch(`${API_URL}/contacts`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const getContact = async (id) => {
    const response = await fetch(`${API_URL}/contacts/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const createContact = async (contactData) => {
    const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const updateContact = async (id, contactData) => {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const deleteContact = async (id) => {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const addContactNote = async (id, text, created_by) => {
    const response = await fetch(`${API_URL}/contacts/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, created_by })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};