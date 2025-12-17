import { CardMember } from "@/common/entities/card-member.entity";
import { Repository } from "typeorm";
import { ICardMemberRepository } from "./card-member.repository.interface";

export class CardMemberRepository implements ICardMemberRepository {
    constructor(private cardMemberRepository: Repository<CardMember>) { }
    async findAllCardMembersByCardId(cardId: string): Promise<CardMember[]> {
        return await this.cardMemberRepository.find({
            where: { cardId },
            relations: ['user'],
        })
    }
    async findByCardAndMemberId(cardId: string, memberId: string): Promise<any | null> {
        return await this.cardMemberRepository.findOne({
            where: { cardId, userId: memberId },
            relations: ['user'],
        });
    }
    async findCardMemberById(cardMemberId: string): Promise<CardMember | null> {
        return await this.cardMemberRepository.findOne({
            where: { id: cardMemberId },
            relations: ['user'],
        });
    }
    async addCardMember(cardId: string, userId: string): Promise<CardMember> {
        const cardMember = this.cardMemberRepository.create({ cardId, userId });
        return await this.cardMemberRepository.save(cardMember);
    }
    async removeCardMember(cardMemberId: string): Promise<void> {
        await this.cardMemberRepository.delete(cardMemberId);
    }
}