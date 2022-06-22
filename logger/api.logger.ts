import pine from 'pine';
import fs from 'fs';
import path from "path";
const logger = pine();

export const morganLogger = fs.createWriteStream(
    path.join(__dirname, "log", "morgan.log"), { flags: "a" }
);

export class APILogger {
    info(message, data) {
        let text = `${message}   ${undefined != data ? JSON.stringify(data) : ''}`;
        this.fileHandler('info', `${text}`);
        logger.info(`${text}`);
    }

    error(message) {
        this.fileHandler('error', message);
        logger.error(message);
    }

    smtp(message, data) {
        let text = `${message}   ${undefined != data ? JSON.stringify(data) : ''}`;
        this.fileHandler('smtp', `${text}`);
        logger.info(`${text}`);
    }

    fileHandler(type, messages) {
        let dir = './logger/log';
        let fileOutput;
        switch (type) {
            case 'smtp':
                fileOutput = './logger/log/smtp.log'
                break;
            case 'info':
                fileOutput = './logger/log/output.log'
                break;
            case 'error':
                fileOutput = './logger/log/error.log'
                break;
        }

        if (!fs.existsSync(dir)){
            fs.promises.mkdir(dir).catch(err => {
                throw err;
            });
        }

        fs.promises.appendFile(fileOutput, `\n[${new Date().toISOString()}] - ${type}: [autoLogger] ${messages} ${new Date()}`)
            .catch(err => {
                throw err;
            });
    }
}
