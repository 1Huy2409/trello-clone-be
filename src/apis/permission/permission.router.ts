import { Router } from "express";
import { PermissionController } from "./permission.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { checkAuthentication } from "@/common/middleware/authentication";

export default function permissionRouter(permissionController: PermissionController): Router {
    const router: Router = Router();

    router.get('/',
        asyncHandler(checkAuthentication),
        asyncHandler(permissionController.findAll)
    );

    return router;
}
