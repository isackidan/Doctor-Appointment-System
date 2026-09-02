const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login(email, password, ipAddress, userAgent);
    res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token: result.token,
        refreshToken: result.refreshToken,
        data: result.user
    });
});

const refresh = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.status(200).json({ status: 'success', token: result.token });
});

const logout = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email is required' });
    }
    const result = await authService.forgotPassword(email);
    res.status(200).json({ status: 'success', data: result });
});

const resetPassword = catchAsync(async (req, res) => {
    const { resetToken, newPassword } = req.body;
    const result = await authService.resetPassword(resetToken, newPassword);
    res.status(200).json({ status: 'success', message: result.message });
});

module.exports = { login, refresh, logout, forgotPassword, resetPassword };
