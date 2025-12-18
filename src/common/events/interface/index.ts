import { BoardEvent } from "./board/board-event";
import {
    CardEvent,
    CardCreatedEvent,
    CardArchivedEvent,
    CardRestoredEvent,
    CardMemberAssignedEvent,
    CardMemberRemovedEvent,
    CardMovedEvent,
    CardReorderedEvent,
    CardUpdatedEvent
} from "./card/card-event";
export enum EventType {
    CARD_CREATED = 'CARD_CREATED',
    CARD_MOVED = 'CARD_MOVED',
    CARD_REORDERED = 'CARD_REORDERED',
    CARD_ARCHIVED = 'CARD_ARCHIVED',
    CARD_RESTORED = 'CARD_RESTORED',
    CARD_UPDATED = 'CARD_UPDATED',
    CARD_MEMBER_ASSIGNED = 'CARD_MEMBER_ASSIGNED',
    CARD_MEMBER_REMOVED = 'CARD_MEMBER_REMOVED',
    BOARD_EVENT = 'BOARD_EVENT'
}
export type DomainEvent =
    | CardCreatedEvent
    | CardMovedEvent
    | CardReorderedEvent
    | CardArchivedEvent
    | CardRestoredEvent
    | CardUpdatedEvent
    | CardMemberAssignedEvent
    | CardMemberRemovedEvent