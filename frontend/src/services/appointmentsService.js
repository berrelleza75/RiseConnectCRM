const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getAppointments = async (year, month) => {
    const url = year && month
        ? `${API_URL}/appointments?year=${year}&month=${month}`
        : `${API_URL}/appointments`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const createAppointment = async (payload) => {
    const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const updateAppointment = async (id, payload) => {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const deleteAppointment = async (id) => {
    const res = await fetch(`${API_URL}/appointments/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};
