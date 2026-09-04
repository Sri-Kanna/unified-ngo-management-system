import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'unms-super-secret-key-123!';
export const authenticateJWT = (req, res, next) => {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};
