import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerOfficeService = async ({ firstName, lastName, email, phone, password }) => {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        'INSERT INTO users (office_id, first_name, last_name, email, password, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [null, firstName, lastName, email, hashedPassword, 'admin', phone, 'active']
    );

    return { userId: result.insertId };
};

export const registerRealtorService = async ({ firstName, lastName, email, phone, password }) => {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        'INSERT INTO users (office_id, first_name, last_name, email, password, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [null, firstName, lastName, email, hashedPassword, 'realtor', phone, 'active']
    );

    return { userId: result.insertId };
};

export const loginService = async ({ email, password }) => {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { 
            id: user.id, 
            role: user.role, 
            office_id: user.office_id, 
            first_name: user.first_name, 
            last_name: user.last_name 
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );


    return { token, role: user.role };
};