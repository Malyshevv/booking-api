import server from './Server';
import {APILogger} from "./logger/api.logger";
import * as dotenv from 'dotenv';
import {globalMessages} from "./config/globalMessages";
dotenv.config();

const portHttp = parseInt(process.env.NODE_SERVER_PORT || '4000');
const portHttps = parseInt(process.env.NODE_SERVER_PORT_HTTPS || '4443');
const host = process.env.NODE_SERVER_HOST;
const msg = process.env.NODE_USE_HTTPS.toUpperCase() === 'FALSE' ? `${globalMessages['api.server.start']} - http://${host}:${portHttp}` : `${globalMessages['api.server.start']} - http://${host}:${portHttp} и  https://${host}:${portHttps}`;

const starter = new server().start(portHttp,portHttps)
    .then(() => new APILogger().info(`${msg}`,null))
    .then(() => new APILogger().info(globalMessages['api.server.start.finish'],null))
    .catch(error => {
        console.log(error)
    });


export default starter;
