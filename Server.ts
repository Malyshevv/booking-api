import express from "express";
import http from 'http';
import https from 'https';
import fs from 'fs';
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
import morganBody from "morgan-body";

class Server {
    public app;
    public io;
    public socketIo;
    public logger;
    public sitemap;
    public swDocument;
    public privateKey;
    public certificate;
    public credentials;
    public morganBody;
    public saveMorgan;

    constructor() {
        this.logger = new APILogger();
        this.app = express();
        this.socketIo = require('socket.io');
        this.morganBody = require('morgan-body');
        this.saveMorgan = fs.createWriteStream(
            path.join(__dirname, "/logger/log", "morgan.log"), { flags: "a" }
        );
        /* certificate */
        this.privateKey  = fs.readFileSync('./config/sslcert/privatekey.key', 'utf8');
        this.certificate = fs.readFileSync('./config/sslcert/certificate.crt', 'utf8');
        this.credentials = {key: this.privateKey, cert: this.certificate};
        /* DOC */
        this.sitemap = require('./scripts/swagger/express-sitemap-html');
        this.swDocument = require('./config/openapi');
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
        /* Body Logger */
        this.morganBody(this.app, {
            logIP: true,
            logRequestId: true,
            includeNewLine: true,
            includeFinalNewLine: true,
            theme: 'dimmed',
            noColors: true,
            DateTimeFormatType: 'utc',
            logRequestBody: true,
            prettify: true,
            logResponseBody: true,
            stream: this.saveMorgan,
        });

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
        this.app.set('app', this.app);
        this.app.use('/api/auth', authRouter);
        this.app.use('/api/users',verifyToken, userRouter);
        /*Generate Body*/

        /*Generate End  Body*/
        this.sitemap.swagger(this.swDocument, this.app);
        this.app.use('/', staticRouter);
    }

    public start = (portHttp: number, portHttps: number) => {

        return new Promise((resolve, reject) => {

            // HTTP
            const serverHttp =  http.createServer(this.app).listen(portHttp, () => {
                resolve(portHttp);
            }).on('error', (err: any) => reject(err));

            // HTTPS
             const serverHttps = https.createServer(this.credentials, this.app).listen(portHttps, () => {
                resolve(portHttps);
            }).on('error', (err: any) => reject(err));


            /*
            const server = this.app.listen(port, () => {
                resolve(port);
            }).on('error', (err: any) => reject(err));
            */

            this.io = this.socketIo()
            this.io.attach(serverHttp)
            this.io.attach(serverHttps)
            this.logger.info(globalMessages['socket.server.start'],null)
            this.socketWorker()
        });
    }
}

export default Server;
