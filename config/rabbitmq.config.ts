import amqplib, {Channel, Connection} from 'amqplib';
import {globalMessages} from "./globalMessages";
import {v4 as uuidv4} from "uuid";

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

export function insertQueueRabbit(rabbitChannel, data) {
    rabbitChannel.assertQueue(data.queueName);
    rabbitChannel.consume(data.queueName, async function (msg) {
        const response = {
            uuid: uuidv4(),
        }
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
