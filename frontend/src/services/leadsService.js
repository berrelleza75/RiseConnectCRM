import { apiFetch } from '../utils/apiFetch';

export const getLeads = async () => {
    const res = await apiFetch('/leads');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const getLeadsByContact = async (contactId) => {
    const res = await apiFetch(`/leads/contact/${contactId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const getLead = async (id) => {
    const res = await apiFetch(`/leads/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const createLead = async (leadData) => {
    const res = await apiFetch('/leads', { method: 'POST', body: JSON.stringify(leadData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const updateLead = async (id, leadData) => {
    const res = await apiFetch(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(leadData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message);
    return data;
};

export const deleteLead = async (id) => {
    const res = await apiFetch(`/leads/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const addLeadNote = async (id, text, created_by) => {
    const res = await apiFetch(`/leads/${id}/notes`, { method: 'POST', body: JSON.stringify({ text, created_by }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};
