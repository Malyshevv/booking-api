import { Request, Response } from 'express';
import { MainController } from '../MainController';
import {sendQuery} from "../../config/db.config";
import {globalMessages} from "../../config/globalMessages";

export class UsersController extends MainController {
    /*Не забываем конструктор*/
    constructor(){
        super();
    }

    public async create(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method']);
        res.status(500).json(globalMessages['api.not_found.method']);
    }

    public async read(req: Request, res: Response): Promise<void> {
        try {
            const client = await sendQuery.connect();

            const sql = "SELECT * FROM users WHERE id = $1";
            const { rows } = await client.query(sql, [req.params.id]);
            const users = rows;

            client.release();

            this.logger.info(globalMessages['api.request.successful'], users)
            res.status(200).json({result: users});
        } catch (error) {
            this.logger.error('Error. ' + error)
            res.status(400).json({error : error});
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        const client = await sendQuery.connect();
        try {
            let resultUser;

            if (!req.body.id) {
                res.status(500).json({error: globalMessages['api.user.update.required.id']});
                return;
            }
            const sql = "SELECT * FROM users WHERE id = $1";
            const { rows } = await client.query(sql, [parseInt(req.body.id)]);
            const users = rows;
            // @ts-ignore
            if (users.length) {
                // @ts-ignore
                let fileData = req.file;

                if (!fileData) {
                    res.status(500).json({error: globalMessages['api.user.update.error.upload']});
                    return;
                }

                const userData = {
                    id: req.body.id,
                    avatar: fileData.filename || users[0].avatar,
                    phone: req.body.phone || users[0].phone
                }

                await client.query('BEGIN')
                const updateUser = "UPDATE users SET avatar = $2, phone = $3 WHERE id = $1;";
                resultUser = await client.query(updateUser,
                    [
                        userData.id,
                        userData.avatar,
                        userData.phone
                    ]);

                await client.query('COMMIT');
                client.release();

                this.logger.info(globalMessages['api.request.successful'], users)
                res.status(200).json({result: users});
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
        this.logger.error(globalMessages['api.not_found.method']);
        res.status(500).json(globalMessages['api.not_found.method']);
    }
}
