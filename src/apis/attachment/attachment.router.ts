import { Router } from "express";
import multer from "multer";
import AttachmentController from "./attachment.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { checkAuthentication } from "@/common/middleware/authentication";
import { checkAttachmentPermission, checkCardPermission } from "@/common/middleware/authorization";
import { PERMISSIONS } from "@/common/constants/permissions";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default function attachmentRouter(attachmentController: AttachmentController): Router {
    const router = Router();
    console.log("Initializing Attachment Router");

    router.post('/',
        asyncHandler(checkAuthentication),
        upload.single('file'),
        asyncHandler(checkAttachmentPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(attachmentController.uploadAttachment)
    );

    router.delete('/:id',
        asyncHandler(checkAuthentication),
        asyncHandler(checkAttachmentPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(attachmentController.deleteAttachment)
    );

    router.get('/card/:cardId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCardPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(attachmentController.getAttachments)
    );

    return router;
}
