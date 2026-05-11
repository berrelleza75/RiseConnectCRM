const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiFetch = (path, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
};
