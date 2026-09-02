const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } = require('../config/jwt');
const AppError = require('../utils/AppError');

class AuthService {
    async login(email, password, ipAddress = null, userAgent = null) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                patientProfile: true,
                doctorProfile: true
            }
        });

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Log failed login
            await prisma.loginHistory.create({
                data: {
                    userId: user.id,
                    ipAddress,
                    userAgent,
                    status: 'FAILED'
                }
            });
            throw new AppError('Invalid email or password', 401);
        }

        // Account suspension check (Super Admin can suspend via isVerified flag)
        if (!user.isVerified) {
            throw new AppError('Your account has been suspended. Please contact the Super Admin.', 403);
        }

        // Doctor approval check
        if (user.role === 'DOCTOR' && user.doctorProfile && !user.doctorProfile.isApproved) {
            throw new AppError('Your doctor account is pending Super Admin approval', 403);
        }

        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

        // Store refresh token & login history in DB
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await Promise.all([
            prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt
                }
            }),
            prisma.loginHistory.create({
                data: {
                    userId: user.id,
                    ipAddress,
                    userAgent,
                    status: 'SUCCESS'
                }
            })
        ]);

        return {
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                patientId: user.patientProfile?.id || null,
                doctorId: user.doctorProfile?.id || null
            }
        };
    }

    async refresh(refreshTokenStr) {
        if (!refreshTokenStr) throw new AppError('Refresh token required', 400);

        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { token: refreshTokenStr },
            include: { user: true }
        });

        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new AppError('Refresh token invalid or expired', 401);
        }

        const user = tokenRecord.user;
        const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

        return { token: newAccessToken };
    }

    async logout(refreshTokenStr) {
        if (refreshTokenStr) {
            await prisma.refreshToken.deleteMany({ where: { token: refreshTokenStr } });
        }
    }

    async forgotPassword(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Return success even if email not found for security enumeration protection
            return { message: 'If an account with that email exists, password reset instructions have been sent.' };
        }

        // Generate password reset token valid for 1 hour
        const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        return {
            message: 'Password reset token generated successfully',
            resetToken
        };
    }

    async resetPassword(resetToken, newPassword) {
        if (!resetToken || !newPassword) {
            throw new AppError('Reset token and new password are required', 400);
        }

        if (newPassword.length < 6) {
            throw new AppError('Password must be at least 6 characters long', 400);
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET);
        } catch (e) {
            throw new AppError('Invalid or expired password reset token', 400);
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: decoded.id },
            data: { password: newHash }
        });

        // Revoke all existing refresh tokens for security
        await prisma.refreshToken.deleteMany({ where: { userId: decoded.id } });

        return { message: 'Password has been reset successfully. Please sign in with your new password.' };
    }
}

module.exports = new AuthService();
