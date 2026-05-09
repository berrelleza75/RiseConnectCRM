const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getLoans = async () => {
    const response = await fetch(`${API_URL}/loans`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const getLoan = async (id) => {
    const response = await fetch(`${API_URL}/loans/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const createLoan = async (loanData) => {
    const response = await fetch(`${API_URL}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message);
    return data;
};

export const updateLoan = async (id, loanData) => {
    const response = await fetch(`${API_URL}/loans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const deleteLoan = async (id) => {
    const response = await fetch(`${API_URL}/loans/${id}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const addLoanNote = async (id, text, created_by) => {
    const response = await fetch(`${API_URL}/loans/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, created_by })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const addCoBorrower = async (loanId, data) => {
    const response = await fetch(`${API_URL}/loans/${loanId}/co-borrowers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message);
    return json;
};

export const deleteCoBorrower = async (loanId, cobId) => {
    const response = await fetch(`${API_URL}/loans/${loanId}/co-borrowers/${cobId}`, {
        method: 'DELETE'
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message);
    return json;
};
