const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getProspects = async () => {
  const res = await fetch(`${API_URL}/prospects`);
  return res.json();
};

export const getProspect = async (id) => {
  const res = await fetch(`${API_URL}/prospects/${id}`);
  return res.json();
};

export const createProspect = async (data) => {
  const res = await fetch(`${API_URL}/prospects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProspect = async (id, data) => {
  const res = await fetch(`${API_URL}/prospects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteProspect = async (id) => {
  const res = await fetch(`${API_URL}/prospects/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const addNote = async (id, text) => {
  const res = await fetch(`${API_URL}/prospects/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.json();
};