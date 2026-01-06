import { IAttachmentRepository } from "./repositories/attachment.repository.interface";
import { ICardRepository } from "../card/repositories/card.repository.interface";
import { uploadFile, deleteFile } from "@/common/services/cloudinary.service";
import { NotFoundError, BadRequestError } from "@/common/handler/error.response";
import { AttachmentResponse } from "./schemas/attachment.response.schema";
import { toAttachmentResponse } from "./mapper/attachment.mapper";

export default class AttachmentService {
    constructor(
        private attachmentRepository: IAttachmentRepository,
        private cardRepository: ICardRepository
    ) { }

    createAttachment = async (cardId: string, file: Express.Multer.File): Promise<AttachmentResponse> => {
        const card = await this.cardRepository.getCardById(cardId);
        if (!card) {
            throw new NotFoundError(`Card with ID ${cardId} not found`);
        }

        if (!file) {
            throw new BadRequestError("File is required");
        }

        const uploadResult = await uploadFile(file, {
            folder: `trello-clone/attachments/${cardId}`,
            resource_type: 'auto'
        });

        const attachment = await this.attachmentRepository.create({
            cardId: cardId,
            file_url: uploadResult.secure_url,
            file_name: file.originalname,
            file_type: file.mimetype,
            public_id: uploadResult.public_id
        });

        return toAttachmentResponse(attachment);
    }

    deleteAttachment = async (attachmentId: string): Promise<void> => {
        const attachment = await this.attachmentRepository.getById(attachmentId);
        if (!attachment) {
            throw new NotFoundError(`Attachment with ID ${attachmentId} not found`);
        }

        // Delete from Cloudinary
        if (attachment.public_id) {
            let resourceType = 'raw';
            if (attachment.file_type.startsWith('image/')) {
                resourceType = 'image';
            } else if (attachment.file_type.startsWith('video/')) {
                resourceType = 'video';
            }
            await deleteFile(attachment.public_id, resourceType);
        }

        await this.attachmentRepository.delete(attachmentId);
    }

    getAttachmentsByCardId = async (cardId: string): Promise<AttachmentResponse[]> => {
        const card = await this.cardRepository.getCardById(cardId);
        if (!card) {
            throw new NotFoundError(`Card with ID ${cardId} not found`);
        }

        const attachments = await this.attachmentRepository.getByCardId(cardId);
        return attachments.map(toAttachmentResponse);
    }
}
