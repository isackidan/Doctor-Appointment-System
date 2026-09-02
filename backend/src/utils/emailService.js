const nodemailer = require('nodemailer');

// Initialize transporter safely with fallback
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

/**
 * Async Non-blocking Email Dispatcher
 */
const sendEmail = async ({ to, subject, html }) => {
    // If SMTP is configured, send real email asynchronously
    if (transporter) {
        transporter.sendMail({
            from: process.env.SMTP_FROM || '"Lumina Health" <no-reply@luminahealth.com>',
            to,
            subject,
            html,
        }).then(info => {
            console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
        }).catch(err => {
            console.error(`⚠️ Email send failed for ${to}:`, err.message);
        });
    } else {
        // Safe dev fallback log
        console.log(`✉️ [MOCK EMAIL DISPATCH] To: ${to} | Subject: "${subject}"`);
    }
};

/**
 * Appointment Confirmation Template
 */
const sendBookingConfirmation = (patientEmail, patientName, doctorName, date, time, fee) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
            <h2 style="color: #0284c7;">🏥 Lumina Health - Appointment Confirmed</h2>
            <p>Dear <strong>${patientName}</strong>,</p>
            <p>Your appointment with <strong>${doctorName}</strong> has been successfully booked.</p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;">⏰ <strong>Time:</strong> ${time}</p>
                <p style="margin: 5px 0;">💳 <strong>Total Fee:</strong> ₹${fee}</p>
            </div>
            <p>Thank you for choosing Lumina Health!</p>
        </div>
    `;
    sendEmail({ to: patientEmail, subject: 'Appointment Booking Confirmation', html });
};

/**
 * Prescription Issued Notification Template
 */
const sendPrescriptionAlert = (patientEmail, patientName, doctorName, appointmentId) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
            <h2 style="color: #0d9488;">💊 Lumina Health - New Prescription Ready</h2>
            <p>Dear <strong>${patientName}</strong>,</p>
            <p><strong>${doctorName}</strong> has uploaded your prescription for appointment <code>#${appointmentId}</code>.</p>
            <p>Please log in to your patient portal to view and print your prescription details.</p>
            <p>Wishing you a quick recovery!</p>
        </div>
    `;
    sendEmail({ to: patientEmail, subject: 'New Prescription Issued', html });
};

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendPrescriptionAlert
};
