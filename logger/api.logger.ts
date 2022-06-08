import pine from 'pine';
import fs from 'fs';
const logger = pine();

export class APILogger {
    info(message, data) {
        this.fileHandler('info', message);
        logger.info(`${message}   ${undefined != data ? JSON.stringify(data) : ''}`);
    }

    error(message) {
        this.fileHandler('error', message);
        logger.error(message);
    }

    fileHandler(type, messages) {
        let dir = './logger/log';
        let fileOutput = type === 'error' ? './logger/log/error.log' : './logger/log/output.log';

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
