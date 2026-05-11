import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        try {
            req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        } catch (_) {}
    }
    next();
};
