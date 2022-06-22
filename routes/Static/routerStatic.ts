import express from 'express';
import listEndpoints from 'express-list-endpoints';
import nodemailer from 'nodemailer';
import {smtpConfig} from "../../config/smtp.config";
import {verifyToken} from "../../middleware/jwtAuth";

export const router = express.Router({
    strict: true
});

router.get("/", (req, res) => {
    res.render("index.hbs", { title: "Главная" });
});

router.get("/routes", function(req, res){
    res.status(200).json({ routerList: JSON.stringify(listEndpoints(req.app.get('app')))});
});

router.post("/email/send", async function(req, res) {
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
