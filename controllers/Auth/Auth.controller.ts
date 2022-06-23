import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MainController } from '../MainController';
import { sendQuery } from "../../config/db.config";
import { globalMessages } from "../../config/globalMessages";

export class AuthController extends MainController {

    constructor(){
        super();
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

            const queryFind = "SELECT * FROM users WHERE email = $1";
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

                result = {
                    id: resultUser.rows[0].id,
                    token: resultToken.rows[0].authtoken
                }

                await client.query('COMMIT');

                client.release();

                this.logger.info(globalMessages['api.request.successful'], result);

                // @ts-ignore
                req.session.user = result;
                // @ts-ignore
                req.session.save()
                res.status(200).json({
                    // @ts-ignore
                    result: result
                });
            } else {
                res.status(200).json({ error: globalMessages['api.auth.new_user.find']} );
            }
        }
        catch(err) {
            await client.query('ROLLBACK')
            res.status(500).json(err);
        }
    }

    public async read(req: Request, res: Response): Promise<void> {
        try {
            const client = await sendQuery.connect();

            const query = "SELECT " +
                "u.id as id, " +
                "u.username as username, " +
                "u.password as password, " +
                "u.email as email, " +
                "t.authtoken as authtoken " +
                "FROM users u " +
                "LEFT JOIN usertokens t on t.userid = u.id " +
                "WHERE email = $1";
            const result = await client.query(query, [req.body.email]);

            const user = result.rows[0];
            !user && res.status(400).json({ result: globalMessages['api.auth.user.not_found'] });

            const validated = await bcrypt.compare(req.body.password, user.password)
            !validated && res.status(422).json({ result: globalMessages['api.auth.user.password_error'] });

            // @ts-ignore
            req.session.user = user;
            // @ts-ignore
            req.session.save()
            res.status(200).json({result: user});
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
            // @ts-ignore
            await req.session.destroy()
            this.logger.error(globalMessages['request.session.destroy'], sessionData);
            res.status(200).json({result: globalMessages['request.logout.success']})
        } catch (e) {
            this.logger.error(e, null);
            res.status(500).json({
                result: e
            })
        }
    }
}
