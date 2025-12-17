import { Card } from "@/common/entities/card.entity";
import { CardResponse } from "../schemas/card/card.response.schema";
import { ListCardMembersResponseSchema } from "../schemas/card-member/card-member.response.schema";
import { toCardMemberResponse } from "./card-member.mapper";

export const toCardResponse = (card: Card): CardResponse => {
    return {
        id: card.id,
        title: card.title,
        description: card.description,
        position: card.position,
        coverUrl: card.coverUrl,
        priority: card.priority,
        dueDate: new Date(card.dueDate).toISOString(),
        cardMembers: card.cardMembers.map(member => toCardMemberResponse(member)),
        listId: card.listId,
        boardId: card.boardId,
    }
}