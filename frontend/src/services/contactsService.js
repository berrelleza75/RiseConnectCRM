import { apiFetch } from '../utils/apiFetch';

export const getContacts = async () => {
    const res = await apiFetch('/contacts');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const getContact = async (id) => {
    const res = await apiFetch(`/contacts/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const createContact = async (contactData) => {
    const res = await apiFetch('/contacts', { method: 'POST', body: JSON.stringify(contactData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const updateContact = async (id, contactData) => {
    const res = await apiFetch(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(contactData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const deleteContact = async (id) => {
    const res = await apiFetch(`/contacts/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const addContactNote = async (id, text, created_by) => {
    const res = await apiFetch(`/contacts/${id}/notes`, { method: 'POST', body: JSON.stringify({ text, created_by }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};
