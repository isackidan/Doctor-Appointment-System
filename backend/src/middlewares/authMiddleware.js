const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const prisma = require('../config/prisma');

// Verify token for all logged-in users
const verifyToken = async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(403).json({ status: 'error', message: 'No token provided. Access Denied.' });
    }

    try {
        token = token.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach user to req
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized or token expired.' });
    }
};

// Granular RBAC Middleware: authorizeRoles('SUPER_ADMIN', 'RECEPTIONIST', ...)
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `Access denied. ${req.user ? req.user.role : 'Guest'} role does not have permission for this module.`
            });
        }
        next();
    };
};

// Audit Activity Log Middleware — Only logs on successful HTTP responses (2xx)
const logActivity = (action, moduleName) => {
    return (req, res, next) => {
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                try {
                    await prisma.activityLog.create({
                        data: {
                            userId: req.user.id,
                            action,
                            module: moduleName,
                            details: `${req.method} ${req.originalUrl}`,
                            ipAddress: req.ip || req.connection?.remoteAddress
                        }
                    });
                } catch (e) {
                    console.error('Audit Log Error:', e.message);
                }
            }
        });
        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRoles,
    logActivity
};