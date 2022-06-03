import { Request, Response } from 'express';
import {APILogger} from "../logger/api.logger";
import * as dotenv from 'dotenv';
dotenv.config();

export abstract class MainController {

    public logger;
    public env;

    constructor() {
        this.logger = new APILogger();
        this.env = process.env;
    }

    public abstract create(req: Request, res: Response): void;
    public abstract read(req: Request, res: Response): void;
    public abstract update(req: Request, res: Response): void;
    public abstract delete(req: Request, res: Response): void;
}
