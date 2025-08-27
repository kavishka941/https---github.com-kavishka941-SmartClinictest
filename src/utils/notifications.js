import nodemailer from 'nodemailer';
import twilio from 'twilio';


const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 587),
secure: false,
auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});


const twilioClient = process.env.TWILIO_ACCOUNT_SID
? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
: null;


export const notifyEmail = async ({ to, subject, html }) => {
if (!to) return;
await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};


export const notifySMS = async ({ to, body }) => {
if (!twilioClient || !to) return;
await twilioClient.messages.create({ from: process.env.TWILIO_FROM, to, body });
}