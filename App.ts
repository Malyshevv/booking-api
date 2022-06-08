import server from './Server';
import {APILogger} from "./logger/api.logger";
import * as dotenv from 'dotenv';
import {globalMessages} from "./config/globalMessages";
dotenv.config();

const port = parseInt(process.env.NODE_SERVER_PORT || '4000');
const host = process.env.NODE_SERVER_HOST;

const starter = new server().start(port)
    .then(port => new APILogger().info(`${globalMessages['api.server.start']} - http://${host}:${port}`,null))
    .then(() => new APILogger().info(globalMessages['api.server.start.finish'],null))
    .catch(error => {
        console.log(error)
    });


export default starter;
