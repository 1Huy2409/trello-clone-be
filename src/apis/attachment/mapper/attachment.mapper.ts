import { Attachment } from "@/common/entities/attachment.entity";
import { AttachmentResponse } from "../schemas/attachment.response.schema";

export const toAttachmentResponse = (attachment: Attachment): AttachmentResponse => {
    return {
        id: attachment.id,
        cardId: attachment.cardId,
        fileUrl: attachment.file_url,
        fileName: attachment.file_name,
        fileType: attachment.file_type,
        createdAt: attachment.created_at,
    };
};
