const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getLeads = async () => {
    const response = await fetch(`${API_URL}/leads`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const getLeadsByContact = async (contactId) => {
    const response = await fetch(`${API_URL}/leads/contact/${contactId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const getLead = async (id) => {
    const response = await fetch(`${API_URL}/leads/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const createLead = async (leadData) => {
    const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const updateLead = async (id, leadData) => {
    const response = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const deleteLead = async (id) => {
    const response = await fetch(`${API_URL}/leads/${id}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const addLeadNote = async (id, text, created_by) => {
    const response = await fetch(`${API_URL}/leads/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, created_by })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};