import server from './Server';
import {APILogger} from "./logger/api.logger";
import * as dotenv from 'dotenv';
import {globalMessages} from "./config/globalMessages";
dotenv.config();

const port = parseInt(process.env.NODE_SERVER_PORT || '4000');
const host = process.env.NODE_SERVER_HOST;

const starter = new server().start(port)
    .then(port => console.log(`${globalMessages['api.server.start']} - http://${host}:${port}`))
    .then(() => new APILogger().info(`Сервер запущен ${new Date()}`,null))
    .catch(error => {
        console.log(error)
    });


export default starter;
