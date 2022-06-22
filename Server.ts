import express from "express";
import http from 'http';
import https from 'https';
import fs from 'fs';
/*Logger*/
import {APILogger, morganLogger} from "./logger/api.logger";
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
import {smtpConfig} from "./config/smtp.config";

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
    public SMTPServer;
    public SMTPConnection;
    public MailParser;

    constructor() {
        this.logger = new APILogger();
        this.app = express();
        this.socketIo = require('socket.io');
        this.morganBody = require('morgan-body');
        this.saveMorgan = morganLogger;
        /*smtp*/
        this.SMTPServer = require("smtp-server").SMTPServer;
        this.SMTPConnection = require("nodemailer");
        this.MailParser = require('mailparser');
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

    public smtpServer () {
        let MailParser = this.MailParser;
        let logger = this.logger;
        const server = new this.SMTPServer({
            key: this.credentials.key,
            cert: this.credentials.cert,
            authOptional: true,
            onData(stream, session, callback) {
                MailParser.simpleParser(stream, (err, main) => {
                    let data = {
                        from: main.from.text,
                        to: main.to.text,
                        text: main.text
                    }
                    logger.info(globalMessages['smtp.server.mail.send'], data)
                    callback(err);
                });
                /*stream.pipe(process.stdout); // print message to console
                stream.on("end", () => {
                    // reject every other recipient
                    let response = session.envelope.rcptTo.map((rcpt, i) => {
                        if (i % 2) {
                            return new Error("<" + rcpt.address + "> Not accepted");
                        } else {
                            return "<" + rcpt.address + "> Accepted";
                        }
                    });
                    return callback(null, response);
                });*/
            },
            onMailFrom({address}, session, callback) {
                return callback(); // Accept the address
            },
            onRcptTo({address}, session, callback) {
                return callback();
            },
            onConnect(session, callback) {
                return callback(); // Accept the connection
            },
            onAuth(auth, session, callback) {
                if (auth.username !== process.env.SMTP_USER || auth.password !== process.env.SMTP_PASSWORD) {
                    return callback(new Error("Invalid username or password"));
                }
                callback(null, { user: 123 }); // where 123 is the user id or similar property
            }
        });

        server.listen(465, async () => {
            if (await this.SMTPTransporter()) {
                this.logger.info(globalMessages['smtp.server.start'], null)
            } else {
                this.logger.info(globalMessages['smtp.server.error'], null)
            }
        });
    }

    public async SMTPTransporter() {
        this.SMTPConnection = this.SMTPConnection.createTransport(smtpConfig);
        return this.SMTPConnection;
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

             this.smtpServer();
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
