import { EventType } from "..";
import { BoardEvent } from "../board/board-event";

export interface CardEvent extends BoardEvent {
    cardId: string;
}
export interface CardCreatedEvent extends CardEvent {
    type: EventType.CARD_CREATED;
    payload: {
        listId: string;
        position: string;
        title: string;
    }
}
export interface CardUpdatedEvent extends CardEvent {
    type: EventType.CARD_UPDATED;
    payload: {
        title?: string;
        description?: string;
    };
}
export interface CardReorderedEvent extends CardEvent {
    type: EventType.CARD_REORDERED;
    payload: {
        fromListId: string;
        toListId: string;
        fromPosition: string;
        toPosition: string;
    }
}
export interface CardMovedEvent extends CardEvent {
    type: EventType.CARD_MOVED;
    payload: {
        fromBoardId: string;
        toBoardId: string;
        fromListId: string;
        toListId: string;
        fromPosition: string;
        toPosition: string;
    }
}
export interface CardMemberAssignedEvent extends CardEvent {
    type: EventType.CARD_MEMBER_ASSIGNED;
    payload: {
        assignedUserId: string;
    };
}
export interface CardMemberRemovedEvent extends CardEvent {
    type: EventType.CARD_MEMBER_REMOVED;
    payload: {
        removedUserId: string;
    };
}
export interface CardArchivedEvent extends CardEvent {
    type: EventType.CARD_ARCHIVED;
}
export interface CardRestoredEvent extends CardEvent {
    type: EventType.CARD_RESTORED;
}