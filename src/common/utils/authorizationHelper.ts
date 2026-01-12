import { RbacService } from "../rbac/rbac.service";
import { PermissionKey } from "../constants/permissions";

export class AuthorizationHelper {
    private rbacService: RbacService;

    constructor() {
        this.rbacService = new RbacService();
    }

    async canAccessWorkspace(
        userId: string,
        workspaceId: string,
        requiredPermission: PermissionKey
    ): Promise<boolean> {
        return this.rbacService.canUser(userId, requiredPermission, { workspaceId });
    }

    async canAccessBoard(
        userId: string,
        boardId: string,
        requiredPermission: PermissionKey
    ): Promise<boolean> {
        return this.rbacService.canUser(userId, requiredPermission, { boardId });
    }
}
