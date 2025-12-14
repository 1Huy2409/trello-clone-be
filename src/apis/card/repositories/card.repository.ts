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
}