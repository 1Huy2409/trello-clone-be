import { randomUUID } from "crypto";

export const createBaseEvent = (actorId: string) => ({
    eventId: randomUUID(),
    occuredAt: new Date().toISOString(),
    actorId
})