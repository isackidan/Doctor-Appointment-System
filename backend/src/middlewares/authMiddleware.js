const jwt = require('jsonwebtoken');

// Verify token for all logged-in users
const verifyToken = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(403).json({ status: 'error', message: 'No token provided. Access Denied.' });
    }

    try {
        token = token.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized. Invalid Token.' });
    }
};

// Check if user is an ADMIN
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ status: 'error', message: 'Require Admin Role!' });
    }
};

// Check if user is a DOCTOR
const isDoctor = (req, res, next) => {
    if (req.user && req.user.role === 'DOCTOR') {
        next();
    } else {
        return res.status(403).json({ status: 'error', message: 'Require Doctor Role!' });
    }
};

module.exports = { verifyToken, isAdmin, isDoctor };