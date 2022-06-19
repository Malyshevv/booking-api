import express from "express";
/*Logger*/
import {APILogger} from "./logger/api.logger";
/*For Request*/
import cookieParser from "cookie-parser";
import cors from 'cors';
import bodyParser from "body-parser";
/* Path */
import * as path from 'path'
/* Templates */
import hbs from 'hbs';
import * as expressHbs from 'express-handlebars'
/* Routes */
import {
    authRouter,
    userRouter,
    staticRouter,
    /*Generate Import*/

    /*Generate End Import*/
} from './routes/allRoutes';

/* For work with db */
import {sendQuery} from "./config/db.config";
/* Global messages */
import {globalMessages} from "./config/globalMessages";
/* Jwt  */
import {verifyToken} from "./middleware/jwtAuth";
/* Session */
import { sessions } from "./config/store";

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
        this.app.use(cors());
        /* See
        {
        origin: 'http://localhost:3001',
        methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
        credentials: true,
        }
        */

        this.app.use(sessions)

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
        const logger = this.logger;
        sendQuery.connect(function (err:any) {
            logger.info(globalMessages['api.db.connected'], null)
            if (err) throw new Error(err);
        });
    }

    public socketWorker() {
        const logger = this.logger;
        // const ioClient = this.io;
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
        /*Generate Body*/

        /*Generate End  Body*/
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
