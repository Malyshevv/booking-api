import * as dotenv from 'dotenv';
dotenv.config();

export const smtpConfig = {
    name: process.env.SMTP_HOST,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    logger: false,
    debug: true,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
}
