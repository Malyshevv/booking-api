import * as dotenv from 'dotenv';
import {globalMessages} from "./globalMessages";
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

export function smtpServerConf(credentials, MailParser, logger) {
    return {
        key: credentials.key,
        cert: credentials.cert,
        logger: false,
        authOptional: true,
        onData(stream, session, callback) {
            MailParser.simpleParser(stream, (err, main) => {
                let data = {
                    from: main.from.text,
                    to: main.to.text,
                    text: main.text
                }
                logger.smtp(globalMessages['smtp.server.mail.send'], data)
                callback(err);
            });
        },
        onMailFrom(address, session, callback) {
            if (address.address !== process.env.SMTP_SERVER_MAIL) {
                logger.smtp(globalMessages['smtp.server.client.error.email'], null);
                return callback(
                    new Error(globalMessages['smtp.server.client.error.email'])
                );
            }
            logger.smtp(globalMessages['smtp.server.client.successful.email'], {address: address.address});
            return callback(); // Accept the address
        },
        onConnect(session, callback) {
            //console.log("Console in onConnect function>>>",session);
            if (session.remoteAddress.includes('127.0.0.1','0.0.0.0')) {
                logger.smtp(globalMessages['smtp.server.client.error.localhost'], null);
                //return callback(new Error(globalMessages['smtp.server.client.error.localhost']));
            }
            logger.smtp(globalMessages['smtp.server.client.successful.localhost'], {session: session});
            return callback(); // Accept the connection
        },
        onAuth(auth, session, callback) {
            if (auth.username !== process.env.SMTP_USER || auth.password !== process.env.SMTP_PASSWORD) {
                logger.smtp(globalMessages['smtp.server.client.error.login'], null);
                return callback(new Error(globalMessages['smtp.server.client.error.login']));
            }
            let data = { user: { id: session.id, username: 'admin'}};
            logger.smtp(globalMessages['smtp.server.client.successful.login'], data);
            callback(null, data); // where 123 is the user id or similar property
        }
    }
}
