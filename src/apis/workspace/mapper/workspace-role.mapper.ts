import { Role } from "@/common/entities/role.entity";

export interface WorkspaceRoleResponse {
    id: string;
    name: string;
    description: string | null;
    scope: string;
    isSystemRole: boolean;
    workspaceId: string | null;
    permissions: {
        action: string;
        description: string;
    }[];
}

export const toWorkspaceRoleResponse = (role: Role): WorkspaceRoleResponse => {
    return {
        id: role.id,
        name: role.name,
        description: role.description,
        scope: role.scope,
        isSystemRole: role.isSystemRole,
        workspaceId: role.workspaceId,
        permissions: role.rolePermissions?.map(rp => ({
            id: rp.permission.id,
            action: rp.permission.action,
            description: rp.permission.description
        })) || []
    };
};
