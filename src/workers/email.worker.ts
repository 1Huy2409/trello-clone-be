import { redisStream } from "@/config/redis.config";
import { initEmailStream } from "./initStream"
import { EMAIL_GROUP, EMAIL_STREAM } from "@/common/constants/redis";
import { EmailService } from "@/common/utils/mailService";

const CONSUMER = 'worker-1';
const MAX_RETRIES = 3;
const IDLE_TIME = 10000;
const emailService: EmailService = new EmailService();
async function handleMessageProcessing(id: string, messageData: any) {
    try {
        await emailService.sendEmail(messageData);
        await redisStream.xack(EMAIL_STREAM, EMAIL_GROUP, id);
        console.log(`Sent OTP to ${messageData.email} successfully!`);
    } catch (err) {
        console.error("Send email failed", err);
    }
}
async function startMainConsumer() {
    while (true) {
        try {
            const data = await redisStream.xreadgroup(
                "GROUP",
                EMAIL_GROUP,
                CONSUMER,
                "COUNT",
                1,
                "BLOCK",
                5000,
                "STREAMS",
                EMAIL_STREAM,
                ">"
            ) as any;
            if (!data) continue;
            const [[, messages]] = data;

            for (const [id, fields] of messages) {
                const payload = parseMessage(fields);
                try {
                    await handleMessageProcessing(id, payload);
                }
                catch (err) {
                    console.error(`Main loop failed processing ${id}, skip ACK to let retry loop handle it.`);
                }
            }
        }
        catch (err) {
            console.error("Main consumer error:", err);
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
}
async function startRetryConsumer() {
    setInterval(async () => {
        try {
            const response = await redisStream.xautoclaim(
                EMAIL_STREAM,
                EMAIL_GROUP,
                CONSUMER,
                IDLE_TIME,
                "0-0",
                "COUNT",
                5
            ) as any;

            // response format: [nextId, [messages]]
            const messages = response[1];

            if (messages.length === 0) return;

            console.log(`Found ${messages.length} stuck messages, retrying...`);

            for (const [id, fields] of messages) {
                const pendingInfo = await redisStream.xpending(EMAIL_STREAM, EMAIL_GROUP, "-", "+", 1, id) as any;

                // pendingInfo[0][3]: delivery counter
                const deliveryCount = pendingInfo[0] ? pendingInfo[0][3] : 1;

                if (deliveryCount > MAX_RETRIES) {
                    console.error(`Poison Message ${id}: Failed ${deliveryCount} times. Moving to Dead Letter.`);
                    await redisStream.xack(EMAIL_STREAM, EMAIL_GROUP, id);
                    continue;
                }

                const payload = parseMessage(fields);
                try {
                    await handleMessageProcessing(id, payload);
                } catch (err) {
                    console.error(`Retry failed again for ${id}. Wait for next cycle.`);
                }
            }

        } catch (err) {
            console.error("Retry consumer error:", err);
        }
    }, 5000);
}
function parseMessage(fields: string[]) {
    const flatPayload: any = {};
    for (let i = 0; i < fields.length; i += 2) {
        const key = fields[i];
        if (key) {
            flatPayload[key] = fields[i + 1];
        }
    }

    // Transform flat structure to nested structure expected by EmailService
    const { type, email, mailPayload, ...rest } = flatPayload;

    let data: any;
    if (mailPayload) {
        // For board_invitation which sends mailPayload as JSON
        data = JSON.parse(mailPayload);
    } else {
        // For send_otp and forgot_password which send flat otp field
        data = rest;
    }

    return {
        type,
        email,
        data
    };
}

async function startWorkerStream() {
    await initEmailStream();
    startMainConsumer();
    startRetryConsumer();
}
startWorkerStream();