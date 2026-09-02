require('dotenv').config();

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'super_secret_key_for_hospital_erp',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_for_hospital_erp',
    ACCESS_TOKEN_EXPIRES_IN: '1d',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
};
