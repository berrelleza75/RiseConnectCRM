const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getProspects = async () => {
  const res = await fetch(`${API_URL}/api/prospects`);
  return res.json();
};

export const getProspect = async (id) => {
  const res = await fetch(`${API_URL}/api/prospects/${id}`);
  return res.json();
};

export const createProspect = async (data) => {
  const res = await fetch(`${API_URL}/api/prospects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProspect = async (id, data) => {
  const res = await fetch(`${API_URL}/api/prospects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteProspect = async (id) => {
  const res = await fetch(`${API_URL}/api/prospects/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const addNote = async (id, text) => {
  const res = await fetch(`${API_URL}/api/prospects/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.json();
};