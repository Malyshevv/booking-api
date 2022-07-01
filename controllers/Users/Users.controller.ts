import { Request, Response } from 'express';
import { MainController } from '../MainController';
import {sendQuery} from "../../config/db.config";
import {globalMessages} from "../../config/globalMessages";
import {uploadImage} from "../../config/upload.config";
import {make} from "simple-body-validator";

export class UsersController extends MainController {

    public rules;

    /*Не забываем конструктор*/
    constructor(){
        super();
    }

    validate(data, res) {
        this.rules = {};

        const validator = make(data, this.rules.create);

        if (!validator.validate()) {
            let err = validator.errors().all();
            this.logger.error(globalMessages['global.error'] + ' '+ JSON.stringify(err));
            res.status(500).json({error: err});
            return;
        }
    }

    public async create(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method']);
        res.status(500).json(globalMessages['api.not_found.method']);
    }

    public async read(req: Request, res: Response): Promise<void> {
        try {
            const client = await sendQuery.connect();

            const sql =
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

            const { rows } = await client.query(sql, [req.params.id]);
            const users = rows;

            client.release();

            this.logger.info(globalMessages['api.request.successful'], users)
            res.status(200).json(users[0]);
        } catch (error) {
            this.logger.error('Error. ' + error)
            res.status(400).json({error : error});
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        const client = await sendQuery.connect();
        let fileData;
        try {
            let resultUser;

            if (!req.body.id) {
                res.status(500).json({error: globalMessages['api.user.update.required.id']});
                return;
            }
            const sql = "SELECT id FROM users WHERE id = $1";
            const { rows } = await client.query(sql, [parseInt(req.body.id)]);
            const users = rows;

            if (users.length) {
                let upload;

                // @ts-ignore
                if (req.files) {
                    // @ts-ignore
                    fileData = req.files;
                }

                const userData = {
                    id: req.body.id,
                    avatar: (fileData !== undefined) ? fileData.filename : users[0].avatar,
                    phone: req.body.phone || users[0].phone,
                    email: req.body.email || users[0].email,
                    username: req.body.username || users[0].username
                }

                await client.query('BEGIN')
                const updateUser = "UPDATE users SET avatar = $2, phone = $3, email = $4, username = $5 WHERE id = $1;";
                resultUser = await client.query(updateUser,
                    [
                        userData.id,
                        userData.avatar,
                        userData.phone,
                        userData.email,
                        userData.username
                    ]);

                if (fileData) {
                    upload = await uploadImage(fileData.avatar);
                    if (!upload) {
                        this.logger.error(globalMessages['global.error'] + ' ' + JSON.stringify(upload));
                        res.status(500).json(globalMessages['global.error'] + ' ' + JSON.stringify(upload))
                        return;
                    }
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
                    "WHERE u.id = $1";

                const resultUpdate = await client.query(query, [userData.id]);

                await client.query('COMMIT');
                client.release();

                // @ts-ignore
                let sessionData = req.session;

                sessionData.user = resultUpdate;
                await sessionData.save();
                await sessionData.reload();

                let result = {
                    expiresSession: sessionData.cookie.expires,
                    ...resultUpdate
                }

                this.logger.info(globalMessages['api.request.successful'], result)
                res.status(200).json({result: result});
            } else {
                this.logger.info(globalMessages['api.request.error'], null)
                res.status(200).json({error: globalMessages['api.user.update.find_user.not_found']});
            }
        }
        catch (error) {
            await client.query('ROLLBACK')
            this.logger.error('Error.' + error)
            res.status(400).json({error : error});
        }
    }

    public async delete(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method']);
        res.status(500).json(globalMessages['api.not_found.method']);

    }

    public async readAll(req: Request, res: Response): Promise<void> {
        try {
            const client = await sendQuery.connect();

            const sql =
                "SELECT " +
                    "u.id as id, " +
                    "u.username as username, " +
                    "u.email as email, " +
                    "u.avatar as avatar, " +
                    "ug.name as usertype" +
                //"CASE WHEN u.usertype = 0 THEN 'user' WHEN u.usertype = 1 THEN 'admin' ELSE 'banned' END as usertype," +
                "FROM users u " +
                    "LEFT JOIN usersgroups ug on ug.id = u.usertype " +
                "WHERE u.id = $1";
            const { rows } = await client.query(sql);
            const users = rows;

            client.release();

            this.logger.info(globalMessages['api.request.successful'], users)

            res.setHeader('X-Total-Count',users.length)
            res.status(200).json(users);
        } catch (error) {
            this.logger.error('Error. ' + error)
            res.status(400).json({error : error});
        }
    }
}
