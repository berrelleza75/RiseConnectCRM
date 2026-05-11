import { apiFetch } from '../utils/apiFetch';

export const getAppointments = async (year, month) => {
    const query = year && month ? `?year=${year}&month=${month}` : '';
    const res = await apiFetch(`/appointments${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const createAppointment = async (payload) => {
    const res = await apiFetch('/appointments', { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const updateAppointment = async (id, payload) => {
    const res = await apiFetch(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const deleteAppointment = async (id) => {
    const res = await apiFetch(`/appointments/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};
