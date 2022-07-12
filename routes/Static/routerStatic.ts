import express from 'express';
import listEndpoints from 'express-list-endpoints';
import nodemailer from 'nodemailer';
import {smtpConfig} from "../../config/smtp.config";
import {verifyToken} from "../../middleware/jwtAuth";

import {insertQueueEmailRabbit, insertQueueRabbit} from "../../config/rabbitmq.config";
import {globalMessages} from "../../config/globalMessages";
import {make} from "simple-body-validator";

export const router = express.Router({
    strict: true
});

router.get("/", (req, res) => {
    res.render("index.hbs", { title: "Главная" });
});

router.get("/routes", function(req, res){
    res.status(200).json({ routerList: JSON.stringify(listEndpoints(req.app.get('app')))});
});

router.get("/session", function(req, res){
    // @ts-ignore
    res.status(200).json({ result: req.session });
});

router.get("/example", function(req, res){
    // @ts-ignore
    res.render("pages/example.hbs", { title: "Example", session: req.session });
});


router.post('/sendNoticeEmail', verifyToken, async (req, res) => {
    const data = req.body
    const rabbitChannel = req.app.get('rabbitChannel');
    const rabbitConnection = req.app.get('rabbitConnection');

    let rules = {
        queueName: ['required', 'string', 'min:3'],
        from: ['required', 'email'],
        subject: ['required', 'string', 'min:3'],
        text: ['required', 'string', 'min:3'],
    };

    const validator = make(data, rules);

    if (!validator.validate()) {
        let err = validator.errors().all();
        res.status(500).json({error: err});
        return false;
    }

    await insertQueueEmailRabbit(rabbitChannel, rabbitConnection, data);
    res.status(200).json({ result: globalMessages['rabbit.queue.inserted.successful'] })

})

router.post("/email/send", verifyToken, async function(req, res) {
    let transporter = nodemailer.createTransport(smtpConfig);
    // @ts-ignore
    let jsonMail = req.body.json;
    if (jsonMail) {
        let mailOptions = {
            from: jsonMail.from,
            to: jsonMail.to,
            subject: jsonMail.subject,
            text: jsonMail.text,
            html: jsonMail.html,
            /*attachments:[
                {
                    filename: req.files.myfile.name,
                    content: new Buffer(req.files.myfile.data,'utf-8')
                }
            ]*/
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                res.send({error: JSON.stringify(error)});
            } else {
                res.send({result: JSON.stringify(info)});
            }
        });
    }
});

router.get("*", function(req, res){
    res.render("404.hbs", { title: "Not Found" });
});
