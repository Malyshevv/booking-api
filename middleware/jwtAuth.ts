import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import {globalMessages} from "../config/globalMessages";
import {APILogger} from "../logger/api.logger";

dotenv.config();

const secretKey = process.env.SECRET_KEY_API;

const logger = new APILogger();

export const verifyToken = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        logger.error(globalMessages['api.jwt.auth.required'])
        return res.status(403).send(globalMessages['api.jwt.auth.required']);
    }

    try {
        req.user = jwt.verify(token, secretKey);
    } catch (err) {
        logger.error(globalMessages['api.jwt.auth.required'])
        return res.status(401).send(globalMessages['api.jwt.auth.invalid']);
    }
    logger.error(globalMessages['api.jwt.auth.successful'])
    return next();
};
