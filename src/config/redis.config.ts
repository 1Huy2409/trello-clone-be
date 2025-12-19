import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
}
export const redisCache = new Redis(redisConfig);
redisCache.on("connect", () => {
    console.log("Connected to Redis server");
});

redisCache.on("error", (err) => {
    console.error("Redis connection error:", err);
});
export const redisStream = new Redis(redisConfig);
export const redisSubscriber = new Redis(redisConfig);
export const redisPublisher = new Redis(redisConfig);
[redisPublisher, redisSubscriber].forEach((client, index) => {
    client.on('connect', () => {
        console.log(`Redis client ${index} connected`);
    });

    client.on('error', (err) => {
        console.error(`Redis client ${index} error`, err);
    });
});