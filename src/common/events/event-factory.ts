import { uuid } from "zod";

export const createBaseEvent = (actorId: string) => ({
    eventId: uuid(),
    occuredAt: new Date().toISOString(),
    actorId
})