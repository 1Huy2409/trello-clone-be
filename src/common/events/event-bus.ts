import { redisPublisher, redisSubscriber } from "@/config/redis.config";
import { DomainEvent } from "./interface"

type EventHandler = (event: DomainEvent) => Promise<void> | void;

export class EventBus {
    private static handlers: EventHandler[] = [];
    private static subscribed: boolean = false;
    private static instance: EventBus;
    private constructor() { }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    static async publish(event: DomainEvent) {
        await redisPublisher.publish('board.events', JSON.stringify(event));
    }
    static async subscribe(handler: EventHandler) {
        await this.handlers.push(handler);
        await redisSubscriber.subscribe('board.events');
        redisSubscriber.on('message', async (channel, message) => {
            const event = JSON.parse(message) as DomainEvent;
            for (const h of this.handlers) {
                await h(event);
            }
        });
        this.subscribed = true;
    }
}