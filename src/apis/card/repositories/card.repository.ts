import { EntityManager, Repository } from "typeorm";
import { ICardRepository } from "./card.repository.interface";
import { Card } from "@/common/entities/card.entity";

export class CardRepository implements ICardRepository {
    constructor(private cardRepository: Repository<Card>) { }
    async create(data: Partial<Card>, manager?: EntityManager): Promise<Card> {
        const repo = manager ? manager.getRepository(Card) : this.cardRepository;
        const card = repo.create(data);
        return await repo.save(card);
    }
    async getCardById(id: string): Promise<Card | null> {
        return await this.cardRepository.findOneBy({ id });
    }
    async getActiveCardById(id: string): Promise<Card | null> {
        return await this.cardRepository.findOneBy({ id, isArchived: false });
    }
    async getArchivedCardsByListId(listId: string): Promise<Card[]> {
        return await this.cardRepository.find({
            where: {
                listId,
                isArchived: true
            },
            order: { position: 'ASC' },
            relations: {
                cardMembers: true
            }
        });
    }
    async getCardsByListId(listId: string): Promise<Card[]> {
        return await this.cardRepository.find({
            where: {
                listId,
                isArchived: false
            },
            order: { position: 'ASC' },
            relations: {
                cardMembers: true
            }
        });
    }
    async update(id: string, data: Partial<Card>, manager?: EntityManager): Promise<Card> {
        const repo = manager ? manager.getRepository(Card) : this.cardRepository;
        await repo.update(id, data);
        const updatedCard = await repo.findOneBy({ id });
        if (!updatedCard) {
            throw new Error(`Card with ID ${id} not found`);
        }
        return updatedCard;
    }
}