import express from "express";
import {APILogger} from "./logger/api.logger";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import * as path from 'path'
import hbs from 'hbs';
import * as expressHbs from 'express-handlebars'

import {
    authRouter,
    userRouter,
    staticRouter
} from './routes/allRoutes';


import {sendQuery} from "./config/db.config";
import {globalMessages} from "./config/globalMessages";
import {verifyToken} from "./middleware/jwtAuth";

class Server {
    public app;
    public io;
    public socketIo;
    public logger;

    constructor() {
        this.logger = new APILogger();
        this.app = express();
        this.socketIo = require('socket.io');
        this.config();
        this.routerConfig();
        this.dbConnect();
    }


    private config() {
        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(bodyParser.json()); // 100kb default
        this.app.use(cookieParser());

        this.app.engine(
            'hbs',
            expressHbs.engine({
                layoutsDir: 'views/layouts',
                defaultLayout: 'layout',
                extname: 'hbs',
            })
        )

        this.app.set("view engine", "hbs");
        this.app.set("views", path.join(__dirname, "views"));
        this.app.use(express.static(path.join(__dirname, "public")));
        hbs.registerPartials(__dirname + '/views/partials')
    }

    private dbConnect() {
        sendQuery.connect(function (err) {
            console.log(globalMessages['api.db.connected']);
            if (err) throw new Error(err);
        });
    }

    public socketWorker() {
        const logger = this.logger;
        // const ioClient = this.io;
        console.log(globalMessages['socket.server.start'])
        this.io.on('connection', (socket) => {
            logger.info(globalMessages['socket.user.connection'] + ': '+ socket.client.id,null)

            socket.on('disconnect', function () {
                logger.info(globalMessages['socket.user.disconnected'] + ': '+ socket.client.id,null)
            });
        })
    }

    public routerConfig() {
        this.app.use('/api/auth', authRouter);
        this.app.use('/api/users',verifyToken, userRouter);
        this.app.use('/', staticRouter);
    }

    public start = (port: number) => {
        return new Promise((resolve, reject) => {
            const server = this.app.listen(port, () => {
                resolve(port);
            }).on('error', (err: any) => reject(err));

            this.io = this.socketIo(server)
            this.logger.info(globalMessages['socket.server.start'],null)
            this.socketWorker()
        });
    }
}

export default Server;
