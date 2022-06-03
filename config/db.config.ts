import * as dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();


const hostName = process.env.DB_HOST;
const userName = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const port =  parseInt(process.env.DB_PORT);

export const sendQuery = new Pool({
    user: userName,
    host: hostName,
    database: database,
    password: password,
    port: port,
    max: 20,
    idleTimeoutMillis: 30000
})
