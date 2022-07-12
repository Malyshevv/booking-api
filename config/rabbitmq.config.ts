import amqplib, {Channel, Connection} from 'amqplib';
import {globalMessages} from "./globalMessages";
import {v4 as uuidv4} from "uuid";
import {smtpConfig} from "./smtp.config";
import nodemailer from 'nodemailer';
import {sendQuery} from "./db.config";

let connection : Connection;
let channel : Channel;

export async function connectRabbit(connection, channel, logger) {
    try {
        let rabbitmqSettings = {
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: process.env.RABBITMQ_PORT_QUEUE,
            username: process.env.RABBITMQ_DEFAULT_USER,
            password: process.env.RABBITMQ_DEFAULT_PASS,
            vhost: '/',
            authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
        }

        connection = await amqplib.connect(rabbitmqSettings);
        channel = await connection.createChannel();

        if (connection) {
            logger.info(globalMessages['rabbit.connected.successful'], null);
            return {
                connection: connection,
                channel: channel
            }
        }

    } catch (error) {
        logger.error(globalMessages['rabbit.connected.error'], error)
    }
}

export async function insertQueueRabbit(rabbitChannel, data) {
    rabbitChannel.assertQueue(data.queueName,{durable: true});
    rabbitChannel.consume(data.queueName, async function (msg) {
        const response = {
            uuid: uuidv4(),
        }
        console.log(response)
        rabbitChannel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
                correlationId: msg.properties.correlationId,
            },
        );
        rabbitChannel.ack(msg);
    });

    return true;
}


export async function insertQueueEmailRabbit(rabbitChannel, rabbitConnection, data) {
    let transporter = nodemailer.createTransport(smtpConfig);

    const client = await sendQuery.connect();

    const sql = "SELECT id, email FROM users";
    const { rows } = await client.query(sql);
    const users = rows;

    client.release();

    for (let i = 0; i < users.length; i++) {
        if (users[i].email) {
            let queueName = data.queueName + "#" + uuidv4();
            await rabbitChannel.assertQueue(queueName);
            await rabbitChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
            await rabbitChannel.consume(queueName, async msg => {
                let content = JSON.parse(msg.content);

                let mailOptions = {
                    from: content.from,
                    to: users[i].email,
                    subject: content.subject,
                    text: content.text,
                    html: `<b>${content.text}</b>`,
                };
                await transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(JSON.stringify(error));
                        return error;
                    } else {
                        console.log(`Message sent to email ${mailOptions.to} [x] Done`);
                        console.log(JSON.stringify(info))
                    }
                });
                await rabbitChannel.ack(msg);
            });
        }

    }

    return true;
}
