import { EntityManager } from "typeorm";
import { Attachment } from "@/common/entities/attachment.entity";

export interface IAttachmentRepository {
    create(data: Partial<Attachment>, manager?: EntityManager): Promise<Attachment>;
    delete(id: string, manager?: EntityManager): Promise<void>;
    getById(id: string): Promise<Attachment | null>;
    getByCardId(cardId: string): Promise<Attachment[]>;
}
