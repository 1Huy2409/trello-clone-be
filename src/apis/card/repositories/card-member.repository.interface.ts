export interface ICardMemberRepository {
    findAllCardMembersByCardId(cardId: string): Promise<any[]>;
    findByCardAndMemberId(cardId: string, memberId: string): Promise<any | null>;
    findCardMemberById(cardMemberId: string): Promise<any | null>;
    addCardMember(cardId: string, userId: string): Promise<any>;
    removeCardMember(cardMemberId: string): Promise<void>;
}