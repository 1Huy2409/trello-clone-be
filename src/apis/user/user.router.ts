import express, { Router } from 'express'
import multer from 'multer';
import { asyncHandler } from "@/common/middleware/asyncHandler";
import UserController from "./user.controller";
import { checkAuthentication } from "@/common/middleware/authentication";


export default function userRouter(userController: UserController): Router {
    const router: Router = express.Router();
    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

    router.get('/', asyncHandler(userController.findAll));
    router.get('/me', asyncHandler(checkAuthentication), asyncHandler(userController.getMe))
    router.patch(
        '/profile',
        asyncHandler(checkAuthentication),
        asyncHandler(userController.updateProfile)
    );
    router.post(
        '/avatar',
        asyncHandler(checkAuthentication),
        upload.single('avatar'),
        asyncHandler(userController.uploadAvatar)
    );
    router.get('/:id', asyncHandler(userController.findByID))
    router.get('/me', asyncHandler(checkAuthentication), asyncHandler(userController.getMe))

    return router;
}
