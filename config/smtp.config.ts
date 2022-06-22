import * as dotenv from 'dotenv';
dotenv.config();

export const smtpConfig = {
    name: process.env.SMTP_HOST, // smtp.yandex.ru
    host: process.env.SMTP_HOST, // smtp.yandex.ru
    port: process.env.SMTP_PORT, // 465
    logger: false,
    debug: true,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // YOUR YANDEX EMAIL
        pass: process.env.SMTP_PASSWORD, // YOUR YANDEX PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
}
