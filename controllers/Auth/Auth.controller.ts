import {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {MainController} from '../MainController';
import {sendQuery} from "../../config/db.config";
import {globalMessages} from "../../config/globalMessages";
import { make } from 'simple-body-validator';

export class AuthController extends MainController {

    public rules;

    constructor(){
        super();
    }

    validate(data, res, type) {
        this.rules = {
            create: {
                username: ['required', 'string', 'min:3'],
                email: ['required', 'email'],
                password: ['required', 'string', 'min:3'],
            },
            read: {
                email: ['required', 'email'],
                password: ['required', 'string', 'min:3'],
            }
        };

        let rule;

        switch (type) {
            case 'login' :
                rule = this.rules.create;
                break;
            case 'register':
                rule = this.rules.read;
                break;
        }

        const validator = make(data, rule);

        if (!validator.validate()) {
            let err = validator.errors().all();
            this.logger.error(globalMessages['global.error'] + ' '+ JSON.stringify(err));
            res.status(500).json({error: err});
            return false;
        }

        return true;
    }

    public async create(req: Request, res: Response): Promise<void> {
        const client = await sendQuery.connect();
        const secretKey = this.env.SECRET_KEY_API;
        let result;
        let resultUser;
        let resultToken;
        try {
            const salt = await bcrypt.genSalt(10);
            const hashPass = await bcrypt.hash(req.body.password, salt);

            const userData = {
                username: req.body.username,
                email: req.body.email,
                password: hashPass,
            }

            let validate = await this.validate(userData, res, 'login');
            if (!validate) {
                return;
            }

            const queryFind = "SELECT id FROM users WHERE email = $1";
            const { rows } = await client.query(queryFind, [userData.email]);
            const findUser = rows;

            if (!findUser.length) {
                await client.query('BEGIN')
                const insertUser = "INSERT INTO users(username, email, password) VALUES($1, $2, $3)  RETURNING id";
                resultUser = await client.query(insertUser,
                    [
                        userData.username,
                        userData.email,
                        userData.password
                    ]);

                const insertToken = "INSERT INTO usertokens(userid, authtoken) VALUES($1, $2)  RETURNING authtoken";
                resultToken = await client.query(insertToken,
                    [
                        resultUser.rows[0].id,
                        jwt.sign({id: resultUser.rows[0].id}, secretKey)
                    ]);

                const query =
                    "SELECT " +
                        "u.id as id, " +
                        "u.username as username, " +
                        "u.password as password, " +
                        "u.email as email, " +
                        "u.avatar as avatar, " +
                        "ug.name as usertype, " +
                        //"CASE WHEN u.usertype = 0 THEN 'user' WHEN u.usertype = 1 THEN 'admin' ELSE 'banned' END as usertype," +
                        "t.authtoken as token " +
                    "FROM users u " +
                        "LEFT JOIN usertokens t on t.userid = u.id " +
                        "LEFT JOIN usersgroups ug on ug.id = u.usertype " +
                    "WHERE u.id = $1";
                const { rows } = await client.query(query, [resultUser.rows[0].id]);

                result = {
                    id: resultUser.rows[0].id,
                    token: resultToken.rows[0].authtoken,
                    username: rows[0].username,
                    email: rows[0].email,
                    phone: rows[0].phone,
                    password: rows[0].password,
                    avatar: rows[0].avatar,
                    usertype: rows[0].usertype
                }

                await client.query('COMMIT');
                client.release();
                // @ts-ignore
                let sessionData = req.session;

                if (sessionData) {
                    await sessionData.destroy();
                }

                sessionData.user = result;
                sessionData.save();

                result = {
                    expiresSession: sessionData.cookie.expires,
                    ...result
                }
                this.logger.info(globalMessages['api.request.successful'], result);
                res.status(200).json(result);
            } else {
                this.logger.error(globalMessages['api.auth.new_user.find'], req);
                res.status(200).json({ error: globalMessages['api.auth.new_user.find']} );
            }
        }
        catch(err) {
            await client.query('ROLLBACK')
            this.logger.error(globalMessages['global.error'], err);
            res.status(500).json(err);
        }
    }

    public async read(req: Request, res: Response): Promise<void> {
        try {
            const client = await sendQuery.connect();

            const userData = {
                email: req.body.email,
                password: req.body.password,
            }


            let validate = await this.validate(userData, res, 'register');
            if (!validate) {
                return;
            }

            const query =
                "SELECT " +
                    "u.id as id, " +
                    "u.username as username, " +
                    "u.password as password, " +
                    "u.email as email, " +
                    "u.avatar as avatar, " +
                    "ug.name as usertype, " +
                    //"CASE WHEN u.usertype = 0 THEN 'user' WHEN u.usertype = 1 THEN 'admin' ELSE 'banned' END as usertype," +
                    "t.authtoken as token " +
                "FROM users u " +
                    "LEFT JOIN usertokens t on t.userid = u.id " +
                    "LEFT JOIN usersgroups ug on ug.id = u.usertype " +
                "WHERE u.email = $1";

            const result = await client.query(query, [req.body.email]);

            let user = result.rows[0];

            if (!user) {
                this.logger.error(globalMessages['api.auth.user.not_found'], req);
                res.status(400).json({ error: globalMessages['api.auth.user.not_found'] });
                return;
            }

            const validated = await bcrypt.compare(req.body.password, user.password)
            if (!validated) {
                this.logger.error(globalMessages['api.auth.user.password_error'], req);
                res.status(422).json({ error: globalMessages['api.auth.user.password_error'] });
                return;
            }

            // @ts-ignore
            let sessionData = req.session;

            if (sessionData) {
                await sessionData.destroy();
            }

            sessionData.user = user;
            await sessionData.save();

            user = {
                expiresSession: sessionData.cookie.expires,
                ...user
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }

    public async delete(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            let sessionData = req.session;
            await sessionData.destroy()
            this.logger.info(globalMessages['request.session.destroy'], sessionData);
            res.status(200).json({result: globalMessages['request.logout.success']})
        } catch (e) {
            this.logger.error(e, null);
            res.status(500).json({
                result: e
            })
        }
    }
}
