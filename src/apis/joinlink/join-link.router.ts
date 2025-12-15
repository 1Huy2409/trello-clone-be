import { JoinLinkResponse, JoinLinkResponseSchema, PostJoinLinkRequest, PostJoinWorkspaceByLinkRequest } from './schemas/join-link.schema';
import { z } from 'zod';
import { Router } from "express";
import { JoinLinkController } from "./join-link.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { checkAuthentication } from "@/common/middleware/authentication";
import { checkWorkspacePermission } from "@/common/middleware/authorization";
import { PERMISSIONS } from "@/common/constants/permissions";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from '@/api-docs/openAPIResponseBuilder';

export default function joinLinkRouter(joinLinkController: JoinLinkController): Router {
    const router: Router = Router();

    router.post('/:id/join-links',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_MEMBERS)),
        asyncHandler(joinLinkController.createJoinLink)
    )
    router.post('/join-by-link',
        asyncHandler(checkAuthentication),
        asyncHandler(joinLinkController.joinByLink)
    )
    router.get('/:id/join-links',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_MEMBERS)),
        asyncHandler(joinLinkController.getWorkspaceJoinLinks)
    )
    router.patch('/:workspaceId/join-links/:linkId/revoke',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_MEMBERS)),
        asyncHandler(joinLinkController.revokeJoinLink)
    )
    router.delete('/:workspaceId/join-links/:linkId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_MEMBERS)),
        asyncHandler(joinLinkController.deleteJoinLink)
    )
    return router;
}