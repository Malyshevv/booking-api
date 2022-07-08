import { createClient } from 'redis';
import {globalMessages} from "./globalMessages";

const redisHost = process.env.REDIS_HOSTS;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;

const client = createClient({
    url: `redis://:${redisPassword}@${redisHost}:${redisPort}`
});

client.on('error', (err) => console.log(globalMessages['redis.connected.error'], err));

export async function connectRedis(logger, redis) {
    try {
       await client.connect();
       logger.info(globalMessages['redis.connected.successful'], null)

       redis = client;

        return {
            redis: redis
        }

    } catch (error) {
        logger.error(globalMessages['redis.connected.error'], error)
    }
}
