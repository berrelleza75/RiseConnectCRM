const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getOfficeUsers = async (officeId) => {
    const response = await fetch(`${API_URL}/users?office_id=${officeId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};
