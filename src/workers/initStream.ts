import { redisStream } from "@/config/redis.config";
import { EMAIL_STREAM, EMAIL_GROUP } from "@/common/constants/redis";

export async function initEmailStream() {
    try {
        await redisStream.xgroup('CREATE', EMAIL_STREAM, EMAIL_GROUP, '$', 'MKSTREAM');
        console.log('Email stream group created!');
    }
    catch (err: any) {
        if (!err.message.includes('BUSYGROUP')) {
            console.error('Error creating Redis stream group:', err);
        }
        console.log('Email stream group already exists');
    }
}