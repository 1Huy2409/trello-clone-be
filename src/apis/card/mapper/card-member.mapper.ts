import { CardMember } from "@/common/entities/card-member.entity";
import { CardMemberResponse } from "../schemas/card-member/card-member.response.schema";

export const toCardMemberResponse = (cardMember: CardMember): CardMemberResponse => {
    return {
        id: cardMember.id,
        userId: cardMember.userId,
        fullname: cardMember.user?.fullname,
        avatarUrl: cardMember.user?.avatarUrl,
        cardId: cardMember.cardId,
    }
}