
import { Request, Response } from 'express';
import { MainController } from '../MainController';
import {sendQuery} from "../../config/db.config";
import {globalMessages} from "../../config/globalMessages";
import {make} from "simple-body-validator";

export class PostsController extends MainController {
    public rules;

    /*Не забываем конструктор*/
    constructor(){
        super();
    }

    validate(data, res, type) {
        this.rules = {
            title: ['required', 'string', 'min:5'],
            content: ['required', 'string', 'min:3'],
        };

        const validator = make(data, this.rules);

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

        let resultPost;
        try {
            const postData = {
                title: req.body.title,
                content: req.body.content,
                published: 1,
                dateIns: new Date(),
                userid: req.body.id,
            }

            let validate = await this.validate(postData, res, null);
            if (!validate) {
                return;
            }

            await client.query('BEGIN')
            const insertPost = "INSERT INTO public.post(title, content, published, date_ins, userid) VALUES($1, $2, $3, $4, $5) RETURNING id";
            resultPost = await client.query(insertPost,
                [
                    postData.title,
                    postData.content,
                    postData.published,
                    postData.dateIns,
                    postData.userid
                ]);
            await client.query('COMMIT');

            const sql =
                "SELECT " +
                "p.id as id, " +
                "p.title as username, " +
                "p.content as password, " +
                "p.published as published, " +
                "p.date_ins as dateIns, " +
                "u.username as username " +
                "FROM post p " +
                "LEFT JOIN users u on u.id = p.userid " +
                "WHERE p.id = $1";

            const { rows } = await client.query(sql, [resultPost.rows[0].id]);
            const post = rows[0];

            this.logger.info(globalMessages['api.request.successful'], post || []);
            res.status(200).json(post || []);
        } catch (err) {

            await client.query('ROLLBACK')
            this.logger.error(globalMessages['global.error'], err);
            res.status(500).json(err);
        } finally {
            client.release()
        }
    }

    public async read(req: Request, res: Response): Promise<void> {
        const client = await sendQuery.connect();

        try {
            const sql =
                "SELECT " +
                "p.id as id, " +
                "p.title as username, " +
                "p.content as password, " +
                "p.published as published, " +
                "p.date_ins as dateIns, " +
                "u.username as username " +
                "FROM post p " +
                "LEFT JOIN users u on u.id = p.userid " +
                "WHERE p.id = $1";

            const { rows } = await client.query(sql, [req.params.id]);
            const post = rows[0];

            this.logger.info(globalMessages['api.request.successful'], post)
            res.status(200).json(post || []);
        } catch (error) {
            this.logger.error('Error. ' + error)
            res.status(400).json({error : error});
        } finally {
            client.release()
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        const client = await sendQuery.connect();
        let resultPost;
        try {
            const sql = "SELECT id FROM post WHERE id = $1";
            const { rows } = await client.query(sql, [parseInt(req.body.id)]);
            const post = rows;

            const postData = {
                id: req.body.id,
                title: req.body.title || post[0].title,
                content: req.body.content || post[0].content,
                published: req.body.published || post[0].published,
            }

            await client.query('BEGIN')

            const updateUser = "UPDATE public.post SET title, = $2, content, = $3, published = $4, WHERE id = $1;";
            resultPost = await client.query(updateUser,
                [
                    postData.id,
                    postData.title,
                    postData.content,
                    postData.published,
                ]);
            await client.query('COMMIT');

            this.logger.info(globalMessages['api.request.successful'], postData)
            res.status(200).json({result: postData});
        } catch (err) {
            await client.query('ROLLBACK')
            this.logger.error('Error.' + err)
            res.status(400).json({error : err});
        } finally {

        }
    }

    public async delete(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }

    public async readAll(req: Request, res: Response): Promise<void> {
        const client = await sendQuery.connect();

        try {
            const sql =
                "SELECT " +
                "p.id as id, " +
                "p.title as username, " +
                "p.content as password, " +
                "p.published as published, " +
                "p.date_ins as dateIns, " +
                "u.username as username " +
                "FROM post p " +
                "LEFT JOIN users u on u.id = p.userid " +
                "ORDER BY p.id DESC";

            const { rows } = await client.query(sql);
            const posts = rows;


            this.logger.info(globalMessages['api.request.successful'], posts)

            res.setHeader('X-Total-Count',posts.length)
            res.status(200).json(posts);
        } catch (error) {
            this.logger.error('Error. ' + error)
            res.status(400).json({error : error});
        } finally {
            client.release()
        }
    }
}
