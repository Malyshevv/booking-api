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
        this.logger.error(globalMessages['api.not_found.method'], req);
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
            this.logger.error('Error.', error)
            res.status(400).json({error : error});
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }

    public async delete(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);

    }

    public async readAll(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }
}
