import { MigrationInterface, QueryRunner } from "typeorm";
import { Role, RoleScope } from "../entities/role.entity";
import { Permission, ResourceType } from "../entities/permission.entity";
import { RolePermission } from "../entities/role-permission.entity";
import { PERMISSIONS } from "../constants/permissions";

export class SeedRolesAndPermissions1730000000000 implements MigrationInterface {
    name = 'SeedRolesAndPermissions1730000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const roleRepository = queryRunner.manager.getRepository(Role);
        const permissionRepository = queryRunner.manager.getRepository(Permission);
        const rolePermissionRepository = queryRunner.manager.getRepository(RolePermission);

        console.log('Seeding roles and permissions...');
        console.log('Cleaning old data...');
        await queryRunner.query(`DELETE FROM "board-members"`);
        await queryRunner.query(`DELETE FROM "workspace-members"`);
        await queryRunner.query(`DELETE FROM "role-permission"`);
        await queryRunner.query(`DELETE FROM "roles" WHERE "isSystemRole" = true`);
        await queryRunner.query(`DELETE FROM "permissions"`);

        console.log('Old data cleaned successfully!');

        // Create permissions
        const permissionsData = [
            // WORKSPACE
            { action: PERMISSIONS.WORKSPACE_VIEW, resourceType: ResourceType.WORKSPACE, description: 'View workspace details' },
            { action: PERMISSIONS.WORKSPACE_CREATE, resourceType: ResourceType.WORKSPACE, description: 'Create new workspace' },
            { action: PERMISSIONS.WORKSPACE_UPDATE, resourceType: ResourceType.WORKSPACE, description: 'Update workspace details' },
            { action: PERMISSIONS.WORKSPACE_DELETE, resourceType: ResourceType.WORKSPACE, description: 'Delete workspace' },
            { action: PERMISSIONS.WORKSPACE_MANAGE_MEMBERS, resourceType: ResourceType.WORKSPACE, description: 'Add, remove, and update workspace members' },
            { action: PERMISSIONS.WORKSPACE_VIEW_MEMBERS, resourceType: ResourceType.WORKSPACE, description: 'View workspace members list' },
            { action: PERMISSIONS.WORKSPACE_MANAGE_ROLES, resourceType: ResourceType.WORKSPACE, description: 'Manage roles & permissions in workspace' },

            // BOARD
            { action: PERMISSIONS.BOARD_VIEW, resourceType: ResourceType.BOARD, description: 'View board details' },
            { action: PERMISSIONS.BOARD_CREATE, resourceType: ResourceType.BOARD, description: 'Create new board in workspace' },
            { action: PERMISSIONS.BOARD_UPDATE, resourceType: ResourceType.BOARD, description: 'Update board details' },
            { action: PERMISSIONS.BOARD_DELETE, resourceType: ResourceType.BOARD, description: 'Delete board from workspace' },
            { action: PERMISSIONS.BOARD_MANAGE_MEMBERS, resourceType: ResourceType.BOARD, description: 'Add, remove, and update board members' },
            { action: PERMISSIONS.BOARD_VIEW_MEMBERS, resourceType: ResourceType.BOARD, description: 'View board members list' },
            { action: PERMISSIONS.LIST_VIEW, resourceType: ResourceType.LIST, description: 'View lists in board' },
            { action: PERMISSIONS.LIST_CREATE, resourceType: ResourceType.LIST, description: 'Create new list' },
            { action: PERMISSIONS.LIST_UPDATE, resourceType: ResourceType.LIST, description: 'Update list details' },
            { action: PERMISSIONS.LIST_DELETE, resourceType: ResourceType.LIST, description: 'Delete list' },

            // CARD Permissions
            { action: PERMISSIONS.CARD_VIEW, resourceType: ResourceType.CARD, description: 'View cards in list' },
            { action: PERMISSIONS.CARD_CREATE, resourceType: ResourceType.CARD, description: 'Create new card' },
            { action: PERMISSIONS.CARD_UPDATE, resourceType: ResourceType.CARD, description: 'Update card details' },
            { action: PERMISSIONS.CARD_DELETE, resourceType: ResourceType.CARD, description: 'Delete card' },
            { action: PERMISSIONS.CARD_ASSIGN, resourceType: ResourceType.CARD, description: 'Assign card to members' },

            // COMMENT Permissions
            { action: PERMISSIONS.COMMENT_VIEW, resourceType: ResourceType.COMMENT, description: 'View comments' },
            { action: PERMISSIONS.COMMENT_CREATE, resourceType: ResourceType.COMMENT, description: 'Create comment' },
            { action: PERMISSIONS.COMMENT_UPDATE, resourceType: ResourceType.COMMENT, description: 'Update own comment' },
            { action: PERMISSIONS.COMMENT_DELETE, resourceType: ResourceType.COMMENT, description: 'Delete own comment' },
        ];

        const createdPermissions = await permissionRepository.save(permissionsData);
        console.log(`Created ${createdPermissions.length} permissions`);

        const getPermission = (action: string) => createdPermissions.find(p => p.action === action);

        // 1. Workspace Owner
        const workspaceOwner = await roleRepository.save({
            name: 'workspace_owner',
            scope: RoleScope.WORKSPACE,
            description: 'Workspace Owner with full permissions',
            isSystemRole: true,
        });

        const workspaceOwnerPermissions = createdPermissions.map(p => ({
            roleId: workspaceOwner.id,
            permissionId: p.id
        }));
        await rolePermissionRepository.save(workspaceOwnerPermissions);
        console.log('Created role: workspace_owner');

        // 2. Workspace Admin
        const workspaceAdmin = await roleRepository.save({
            name: 'workspace_admin',
            scope: RoleScope.WORKSPACE,
            description: 'Workspace Admin with elevated permissions',
            isSystemRole: true,
        });

        const workspaceAdminActions = [
            PERMISSIONS.WORKSPACE_VIEW,
            PERMISSIONS.WORKSPACE_UPDATE,
            PERMISSIONS.WORKSPACE_MANAGE_MEMBERS,
            PERMISSIONS.WORKSPACE_VIEW_MEMBERS,
            PERMISSIONS.BOARD_VIEW,
            PERMISSIONS.BOARD_CREATE,
            PERMISSIONS.BOARD_UPDATE,
            PERMISSIONS.BOARD_DELETE,
            PERMISSIONS.BOARD_MANAGE_MEMBERS,
            PERMISSIONS.BOARD_VIEW_MEMBERS,
            PERMISSIONS.WORKSPACE_MANAGE_ROLES,
            PERMISSIONS.LIST_VIEW,
            PERMISSIONS.LIST_CREATE,
            PERMISSIONS.LIST_UPDATE,
            PERMISSIONS.LIST_DELETE,
            PERMISSIONS.CARD_VIEW,
            PERMISSIONS.CARD_CREATE,
            PERMISSIONS.CARD_UPDATE,
            PERMISSIONS.CARD_DELETE,
            PERMISSIONS.CARD_ASSIGN,
            PERMISSIONS.COMMENT_VIEW,
            PERMISSIONS.COMMENT_CREATE,
            PERMISSIONS.COMMENT_UPDATE,
            PERMISSIONS.COMMENT_DELETE,
        ];

        const workspaceAdminPermissions = workspaceAdminActions
            .map(action => {
                const permission = getPermission(action);
                return permission ? { roleId: workspaceAdmin.id, permissionId: permission.id } : null;
            })
            .filter(p => p !== null);

        await rolePermissionRepository.save(workspaceAdminPermissions);
        console.log('Created role: workspace_admin');

        // 3. Workspace Member
        const workspaceMember = await roleRepository.save({
            name: 'workspace_member',
            scope: RoleScope.WORKSPACE,
            description: 'Basic member with view and limited edit permissions',
            isSystemRole: true
        });

        const workspaceMemberActions = [
            PERMISSIONS.WORKSPACE_VIEW,
            PERMISSIONS.WORKSPACE_VIEW_MEMBERS,
            PERMISSIONS.BOARD_VIEW,
            PERMISSIONS.BOARD_CREATE,
            PERMISSIONS.BOARD_VIEW_MEMBERS,
            PERMISSIONS.LIST_VIEW,
            PERMISSIONS.LIST_CREATE,
            PERMISSIONS.CARD_VIEW,
            PERMISSIONS.CARD_CREATE,
            PERMISSIONS.CARD_UPDATE,
            PERMISSIONS.COMMENT_VIEW,
            PERMISSIONS.COMMENT_CREATE,
            PERMISSIONS.COMMENT_UPDATE,
        ];

        const workspaceMemberPermissions = workspaceMemberActions
            .map(action => {
                const permission = getPermission(action);
                return permission ? { roleId: workspaceMember.id, permissionId: permission.id } : null;
            })
            .filter(p => p !== null);

        await rolePermissionRepository.save(workspaceMemberPermissions);
        console.log('Created role: workspace_member');

        // 4. Board Owner
        const boardOwner = await roleRepository.save({
            name: 'board_owner',
            scope: RoleScope.BOARD,
            description: 'Owner of the board with full control',
            isSystemRole: true
        });

        const boardOwnerActions = [
            PERMISSIONS.BOARD_VIEW,
            PERMISSIONS.BOARD_UPDATE,
            PERMISSIONS.BOARD_DELETE,
            PERMISSIONS.BOARD_MANAGE_MEMBERS,
            PERMISSIONS.BOARD_VIEW_MEMBERS,
            PERMISSIONS.LIST_VIEW,
            PERMISSIONS.LIST_CREATE,
            PERMISSIONS.LIST_UPDATE,
            PERMISSIONS.LIST_DELETE,
            PERMISSIONS.CARD_VIEW,
            PERMISSIONS.CARD_CREATE,
            PERMISSIONS.CARD_UPDATE,
            PERMISSIONS.CARD_DELETE,
            PERMISSIONS.CARD_ASSIGN,
            PERMISSIONS.COMMENT_VIEW,
            PERMISSIONS.COMMENT_CREATE,
            PERMISSIONS.COMMENT_UPDATE,
            PERMISSIONS.COMMENT_DELETE,
        ];

        const boardOwnerPermissions = boardOwnerActions
            .map(action => {
                const permission = getPermission(action);
                return permission ? { roleId: boardOwner.id, permissionId: permission.id } : null;
            })
            .filter(p => p !== null);

        await rolePermissionRepository.save(boardOwnerPermissions);
        console.log('Created role: board_owner');

        // 5. Board Admin
        const boardAdmin = await roleRepository.save({
            name: 'board_admin',
            scope: RoleScope.BOARD,
            description: 'Administrator of the board with most permissions',
            isSystemRole: true
        });

        const boardAdminActions = [
            PERMISSIONS.BOARD_VIEW,
            PERMISSIONS.BOARD_UPDATE,
            PERMISSIONS.BOARD_MANAGE_MEMBERS,
            PERMISSIONS.BOARD_VIEW_MEMBERS,
            PERMISSIONS.LIST_VIEW,
            PERMISSIONS.LIST_CREATE,
            PERMISSIONS.LIST_UPDATE,
            PERMISSIONS.LIST_DELETE,
            PERMISSIONS.CARD_VIEW,
            PERMISSIONS.CARD_CREATE,
            PERMISSIONS.CARD_UPDATE,
            PERMISSIONS.CARD_DELETE,
            PERMISSIONS.CARD_ASSIGN,
            PERMISSIONS.COMMENT_VIEW,
            PERMISSIONS.COMMENT_CREATE,
            PERMISSIONS.COMMENT_UPDATE,
            PERMISSIONS.COMMENT_DELETE,
        ];

        const boardAdminPermissions = boardAdminActions
            .map(action => {
                const permission = getPermission(action);
                return permission ? { roleId: boardAdmin.id, permissionId: permission.id } : null;
            })
            .filter(p => p !== null);

        await rolePermissionRepository.save(boardAdminPermissions);
        console.log('Created role: board_admin');

        // 6. Board Member
        const boardMember = await roleRepository.save({
            name: 'board_member',
            scope: RoleScope.BOARD,
            description: 'Basic board member with view and edit permissions',
            isSystemRole: true
        });

        const boardMemberActions = [
            PERMISSIONS.BOARD_VIEW,
            PERMISSIONS.BOARD_VIEW_MEMBERS,
            PERMISSIONS.LIST_VIEW,
            PERMISSIONS.CARD_VIEW,
            PERMISSIONS.CARD_CREATE,
            PERMISSIONS.CARD_UPDATE,
            PERMISSIONS.COMMENT_VIEW,
            PERMISSIONS.COMMENT_CREATE,
            PERMISSIONS.COMMENT_UPDATE,
        ];

        const boardMemberPermissions = boardMemberActions
            .map(action => {
                const permission = getPermission(action);
                return permission ? { roleId: boardMember.id, permissionId: permission.id } : null;
            })
            .filter(p => p !== null);

        await rolePermissionRepository.save(boardMemberPermissions);
        console.log('Created role: board_member');

        console.log('Seeding completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback - delete all seeded data
        await queryRunner.query(`DELETE FROM "role-permission"`);
        await queryRunner.query(`DELETE FROM "roles" WHERE "isSystemRole" = true`);
        await queryRunner.query(`DELETE FROM "permissions"`);
        console.log('Rollback completed - all seeded data removed');
    }
}