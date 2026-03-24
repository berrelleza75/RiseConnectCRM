import { registerOfficeService, registerRealtorService, loginService } from '../services/authService.js';

export const registerOffice = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const result = await registerOfficeService({ firstName, lastName, email, phone, password });

        res.status(201).json({ message: 'Account created successfully', userId: result.userId });

    } catch (error) {
        if (error.message === 'Email already in use') {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const registerRealtor = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const result = await registerRealtorService({ firstName, lastName, email, phone, password });

        res.status(201).json({ message: 'Account created successfully', userId: result.userId });

    } catch (error) {
        if (error.message === 'Email already in use') {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await loginService({ email, password });

        res.status(200).json({ 
            message: 'Login successful', 
            token: result.token, 
            role: result.role 
        });

    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};