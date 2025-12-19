import { EventBus } from "@/common/events/event-bus";
import { IActivityRepository } from "./repositories/activity.repository.interface";
import { DomainEvent, EventType } from "@/common/events/interface";
import { CardMovedEvent } from "@/common/events/interface/card/card-event";

export class ActivitySubscriber {
    constructor(
        private activityRepository: IActivityRepository
    ) { }
    async init() {
        await EventBus.subscribe(async (event) => {
            switch (event.type) {
                case EventType.CARD_MOVED:
                    await this.handleCardMovedEvent(event as CardMovedEvent);
                    break;
            }
        })
    }
    private async handleCardMovedEvent(event: CardMovedEvent) {
        const message = `Card with ID ${event.cardId} is moved from board ${event.boardId} to board ${event.payload.toBoardId}, list ${event.payload.fromListId} to list ${event.payload.toListId}`;
        await this.activityRepository.logActivity({
            boardId: event.boardId,
            cardId: event.cardId,
            actorId: event.actorId,
            type: event.type,
            message: message,
            payload: event.payload
        });
    }
}