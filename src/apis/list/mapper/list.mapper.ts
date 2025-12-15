import { List } from "@/common/entities/list.entity";
import { ListResponse } from "../schemas/list.response.schema";

export const toListResponse = (list: List): ListResponse => {
    return {
        id: list.id,
        title: list.title,
        position: list.position,
        isArchived: list.isArchived,
        boardId: list.boardId,
    }
}