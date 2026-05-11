import { apiFetch } from '../utils/apiFetch';

export const getLoans = async () => {
    const res = await apiFetch('/loans');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const getLoan = async (id) => {
    const res = await apiFetch(`/loans/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const createLoan = async (loanData) => {
    const res = await apiFetch('/loans', { method: 'POST', body: JSON.stringify(loanData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message);
    return data;
};

export const updateLoan = async (id, loanData) => {
    const res = await apiFetch(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(loanData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const deleteLoan = async (id) => {
    const res = await apiFetch(`/loans/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const addLoanNote = async (id, text, created_by) => {
    const res = await apiFetch(`/loans/${id}/notes`, { method: 'POST', body: JSON.stringify({ text, created_by }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const addCoBorrower = async (loanId, data) => {
    const res = await apiFetch(`/loans/${loanId}/co-borrowers`, { method: 'POST', body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
};

export const deleteCoBorrower = async (loanId, cobId) => {
    const res = await apiFetch(`/loans/${loanId}/co-borrowers/${cobId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
};
