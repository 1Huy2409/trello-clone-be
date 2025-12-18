import { BaseEvent } from "../base-event";

export interface BoardEvent extends BaseEvent {
    boardId: string;
}