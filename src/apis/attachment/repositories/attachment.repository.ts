import { EntityManager, Repository } from "typeorm";
import { IAttachmentRepository } from "./attachment.repository.interface";
import { Attachment } from "@/common/entities/attachment.entity";

export class AttachmentRepository implements IAttachmentRepository {
    constructor(private attachmentRepository: Repository<Attachment>) { }

    async create(data: Partial<Attachment>, manager?: EntityManager): Promise<Attachment> {
        const repo = manager ? manager.getRepository(Attachment) : this.attachmentRepository;
        const attachment = repo.create(data);
        return await repo.save(attachment);
    }

    async delete(id: string, manager?: EntityManager): Promise<void> {
        const repo = manager ? manager.getRepository(Attachment) : this.attachmentRepository;
        await repo.delete(id);
    }

    async getById(id: string): Promise<Attachment | null> {
        return await this.attachmentRepository.findOneBy({ id });
    }

    async getByCardId(cardId: string): Promise<Attachment[]> {
        return await this.attachmentRepository.find({
            where: { cardId },
            order: { created_at: 'DESC' }
        });
    }
}
