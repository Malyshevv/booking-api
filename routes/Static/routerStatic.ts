import express from 'express';
import listEndpoints from 'express-list-endpoints';
import nodemailer from 'nodemailer';
import {smtpConfig} from "../../config/smtp.config";
import {verifyToken} from "../../middleware/jwtAuth";

import {insertQueueRabbit} from "../../config/rabbitmq.config";
import {globalMessages} from "../../config/globalMessages";

export const router = express.Router({
    strict: true
});

router.get("/", (req, res) => {
    res.render("index.hbs", { title: "Главная" });
});

router.get("/routes", verifyToken, function(req, res){
    res.status(200).json({ routerList: JSON.stringify(listEndpoints(req.app.get('app')))});
});

router.get("/session", verifyToken, function(req, res){
    // @ts-ignore
    res.status(200).json({ result: req.session });
});

router.get("/example", function(req, res){
    // @ts-ignore
    res.render("pages/example.hbs", { title: "Example", session: req.session });
});


router.post('/orders', verifyToken, async (req, res) => {
    const data = req.body
    const rabbitChannel = req.app.get('rabbitChannel');

    if (req.body.queueName) {
        insertQueueRabbit(rabbitChannel, data);
        res.status(200).json({ result: globalMessages['rabbit.queue.inserted.successful'] })
    } else {
        res.status(200).json({ result: globalMessages['rabbit.queue.required.name'] })
    }

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
