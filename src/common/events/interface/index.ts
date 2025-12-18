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

export type DomainEvent =
    | CardCreatedEvent
    | CardMovedEvent
    | CardReorderedEvent
    | CardArchivedEvent
    | CardRestoredEvent
    | CardUpdatedEvent
    | CardMemberAssignedEvent
    | CardMemberRemovedEvent