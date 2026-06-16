const cron = require('node-cron');
const pool = require('../config/db');

// Runs every 15 minutes to check for upcoming appointments
const startCronJobs = () => {
    cron.schedule('* * * * *', async () => {
        console.log("⏳ [CRON] Checking for upcoming appointments...");
        try {
            // Query to find appointments happening exactly 24h, 1h, or 15m from now
            // (In a real app, we would send an email here using Nodemailer)
            const query = `
                SELECT a.id, u.email, u.name, da.slot_date, da.start_time 
                FROM appointments a
                JOIN users u ON a.patient_id = u.id
                JOIN doctor_availability da ON a.slot_id = da.id
                WHERE a.status = 'BOOKED' 
                AND da.slot_date >= CURRENT_DATE
            `;
            const { rows } = await pool.query(query);
            
            // Mocking the notification
            rows.forEach(appt => {
                console.log(`🔔 Notification sent to ${appt.email}: Reminder for appointment on ${appt.slot_date.toISOString().split('T')[0]} at ${appt.start_time}`);
            });

        } catch (error) {
            console.error("Cron Job Error:", error);
        }
    });
};

module.exports = startCronJobs;