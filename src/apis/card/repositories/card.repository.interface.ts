import { Card } from "@/common/entities/card.entity";
import { EntityManager } from "typeorm";

export interface ICardRepository {
    create(data: Partial<Card>, manager?: EntityManager): Promise<Card>;
}