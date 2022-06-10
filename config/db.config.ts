import * as dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

export const secretKey = process.env.SECRET_KEY_API;
export const hostName = process.env.DB_HOST;
export const userName = process.env.DB_USER;
export const password = process.env.DB_PASSWORD;
export const database = process.env.DB_NAME;
export const port =  parseInt(process.env.DB_PORT);
export const SCHEME = process.env.DB_SCHEME;

export const sendQuery = new Pool({
    user: userName,
    host: hostName,
    database: database,
    password: password,
    port: port,
    max: 20,
    idleTimeoutMillis: 30000
})
