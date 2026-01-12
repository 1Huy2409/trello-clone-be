import { MigrationInterface, QueryRunner } from "typeorm";
import { Role, RoleScope } from "../entities/role.entity";
import { Permission } from "../entities/permission.entity";
import { RolePermission } from "../entities/role-permission.entity";
import { PERMISSIONS } from "../constants/permissions";

export class SeedViewerRoles1736608500000 implements MigrationInterface {
    name = 'SeedViewerRoles1736608500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const roleRepository = queryRunner.manager.getRepository(Role);
        const permissionRepository = queryRunner.manager.getRepository(Permission);
        const rolePermissionRepository = queryRunner.manager.getRepository(RolePermission);

        console.log('Seeding viewer roles...');

        // Fetch all existing permissions
        const allPermissions = await permissionRepository.find();
        const getPermission = (action: string) => allPermissions.find(p => p.action === action);

        // 1. Workspace Viewer
        const workspaceViewer = await roleRepository.save({
            name: 'workspace_viewer',
            scope: RoleScope.WORKSPACE,
            description: 'Viewer with read-only permissions',
            isSystemRole: true
        });

        const workspaceViewerActions = [
            PERMISSIONS.WORKSPACE_VIEW,
            PERMISSIONS.WORKSPACE_VIEW_MEMBERS,
            PERMISSIONS.BOARD_VIEW,
            PERMISSIONS.BOARD_VIEW_MEMBERS,
            PERMISSIONS.LIST_VIEW,
            PERMISSIONS.CARD_VIEW,
            PERMISSIONS.COMMENT_VIEW,
        ];

        const workspaceViewerPermissions = workspaceViewerActions
            .map(action => {
                const permission = getPermission(action);
                if (!permission) {
                    console.warn(`Permission not found for action: ${action}`);
                }
                return permission ? { roleId: workspaceViewer.id, permissionId: permission.id } : null;
            })
            .filter(p => p !== null) as { roleId: string; permissionId: string }[];

        if (workspaceViewerPermissions.length > 0) {
            await rolePermissionRepository.save(workspaceViewerPermissions);
        }
        console.log('Created role: workspace_viewer');

        // 2. Board Viewer
        const boardViewer = await roleRepository.save({
            name: 'board_viewer',
            scope: RoleScope.BOARD,
            description: 'Viewer with read-only permissions on board',
            isSystemRole: true
        });

        const boardViewerActions = [
            PERMISSIONS.BOARD_VIEW,
            PERMISSIONS.BOARD_VIEW_MEMBERS,
            PERMISSIONS.LIST_VIEW,
            PERMISSIONS.CARD_VIEW,
            PERMISSIONS.COMMENT_VIEW,
        ];

        const boardViewerPermissions = boardViewerActions
            .map(action => {
                const permission = getPermission(action);
                if (!permission) {
                    console.warn(`Permission not found for action: ${action}`);
                }
                return permission ? { roleId: boardViewer.id, permissionId: permission.id } : null;
            })
            .filter(p => p !== null) as { roleId: string; permissionId: string }[];

        if (boardViewerPermissions.length > 0) {
            await rolePermissionRepository.save(boardViewerPermissions);
        }
        console.log('Created role: board_viewer');
        console.log('Viewer roles seeded successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const roleRepository = queryRunner.manager.getRepository(Role);

        const workspaceViewer = await roleRepository.findOne({ where: { name: 'workspace_viewer' } });
        if (workspaceViewer) {
            await roleRepository.remove(workspaceViewer);
        }

        const boardViewer = await roleRepository.findOne({ where: { name: 'board_viewer' } });
        if (boardViewer) {
            await roleRepository.remove(boardViewer);
        }

        console.log('Rollback viewer roles completed');
    }
}
