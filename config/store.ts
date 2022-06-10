import {database, hostName, password, port, secretKey, userName} from "./db.config";

const conPgSimple = require('connect-pg-simple');
const session = require('express-session');

const conObject = {
    user: userName,
    host: hostName,
    database: database,
    password: password,
    port: port,
}

export const store = new (conPgSimple(session))({
    conObject,
});

export const sessions = session({
    store: store,
    secret: secretKey,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false,
        httpOnly: false,
        sameSite: false,
        maxAge: 1000 * 60 * 60 * 24,
    },
})
