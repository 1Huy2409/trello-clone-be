import express from 'express'
import type { Router } from 'express'
import { User } from '../entities/user.entity'
import { Workspace } from '../entities/workspace.entity'
import UserController from '@/apis/user/user.controller'
import UserService from '@/apis/user/user.service'
import userRouter from '@/apis/user/user.router'
import healthCheckRouter from '@/apis/healthcheck/healthcheck.router'
import { AppDataSource } from '@/config/db.config'
import HealthCheckController from '@/apis/healthcheck/healthcheck.controller'
import AuthService from '@/apis/auth/auth.service'
import AuthController from '@/apis/auth/auth.controller'
import authRouter from '@/apis/auth/auth.router'
import WorkspaceService from '@/apis/workspace/workspace.service'
import WorkspaceController from '@/apis/workspace/workspace.controller'
import workspaceRouter from '@/apis/workspace/workspace.router'
import { WorkspaceMember } from '../entities/workspace-member.entity'
import { Board } from '../entities/board.entity'
import { BoardMember } from '../entities/board-member.entity'
import { BoardJoinLink } from '../entities/board-join-link.entity'
import BoardService from '@/apis/board/board.service'
import BoardController from '@/apis/board/board.controller'
import boardRouter from '@/apis/board/board.router'
import { Role } from '../entities/role.entity'
import { UserRepository } from '@/apis/user/repositories/user.repository'
import { WorkspaceRepository } from '@/apis/workspace/repositories/workspace.repository'
import { WorkspaceMemberRepository } from '@/apis/workspace/repositories/workspace-member.repository'
import { BoardRepository } from '@/apis/board/repositories/board.repository'
import { BoardMemberRepository } from '@/apis/board/repositories/board-member.repository'
import { BoardJoinLinkRepository } from '@/apis/board/repositories/board-join-link.repository'
import { RoleRepository } from '@/apis/role/repositories/role.repository'
import { WorkspaceJoinLink } from '../entities/workspace-join-link.entity'
import { JoinLinkRepository } from '@/apis/joinlink/repositories/join-link.repository'
import { JoinLinkService } from '@/apis/joinlink/join-link.service'
import { JoinLinkController } from '@/apis/joinlink/join-link.controller'
import joinLinkRouter from '@/apis/joinlink/join-link.router'
import { Permission } from '../entities/permission.entity'
import { PermissionRepository } from '@/apis/permission/repositories/permission.repository'
import { RolePermissionRepository } from '@/apis/role-permission/repositories/role-permission.repository'
import { RolePermission } from '../entities/role-permission.entity'
import { WorkspaceRoleService } from '@/apis/workspace/workspace-role.service'
import { RbacService } from '../rbac/rbac.service'
import { List } from '../entities/list.entity'
import { Card } from '../entities/card.entity';
import { CardRepository } from '@/apis/card/repositories/card.repository';
import ListService from '@/apis/list/list.service';
import { ListRepository } from '@/apis/list/repositories/list.repository'
import ListController from '@/apis/list/list.controller'
import listRouter from '@/apis/list/list.router'
import { registerListPaths } from '@/apis/list/list.openapi'
import { registerAuthPaths } from '@/apis/auth/auth.openapi'
import { registerUserPaths } from '@/apis/user/user.openapi'
import { registerWorkspacePaths } from '@/apis/workspace/workspace.openapi'
import { registerJoinLinkPaths } from '@/apis/joinlink/join-link.openapi'
import { registerBoardPaths } from '@/apis/board/board.openapi'
import { registerHealthCheckPaths } from '@/apis/healthcheck/healthcheck.openapi'
import CardService from '@/apis/card/card.service'
import CardController from '@/apis/card/card.controller'
import { registerCardPaths } from '@/apis/card/card.openapi'
import cardRouter from '@/apis/card/card.router'
import { CardMember } from '../entities/card-member.entity'
import { CardMemberRepository } from '@/apis/card/repositories/card-member.repository'

const mainRouter: Router = express.Router()
const initHealthCheckModule = () => {
    const healthCheckController = new HealthCheckController();
    registerHealthCheckPaths();
    mainRouter.use('/health-check', healthCheckRouter(healthCheckController))
}
const initUserModule = () => {
    const userOrmRepo = AppDataSource.getRepository(User);
    const userRepository = new UserRepository(userOrmRepo)
    const userService = new UserService(userRepository);
    const userController = new UserController(userService);
    registerUserPaths();
    mainRouter.use('/users', userRouter(userController));
}
// need fixing
const initAuthModule = () => {
    const userOrmRepo = AppDataSource.getRepository(User);
    const userRepository = new UserRepository(userOrmRepo);
    registerAuthPaths();
    const authService = new AuthService(userRepository);
    const authController = new AuthController(authService);
    mainRouter.use('/auth', authRouter(authController))
}

const initWorkspaceModule = () => {
    const workspaceOrmRepo = AppDataSource.getRepository(Workspace);
    const workspaceRepository = new WorkspaceRepository(workspaceOrmRepo);
    const workspaceMemberOrmRepo = AppDataSource.getRepository(WorkspaceMember);
    const workspaceMemberRepository = new WorkspaceMemberRepository(workspaceMemberOrmRepo);
    const boardOrmRepo = AppDataSource.getRepository(Board);
    const boardRepository = new BoardRepository(boardOrmRepo);
    const roleOrmRepo = AppDataSource.getRepository(Role);
    const roleRepository = new RoleRepository(roleOrmRepo);
    const permissionOrmRepo = AppDataSource.getRepository(Permission);
    const permissionRepository = new PermissionRepository(permissionOrmRepo);
    const rolePermissionOrmRepo = AppDataSource.getRepository(RolePermission);
    const rolePermissionRepository = new RolePermissionRepository(rolePermissionOrmRepo);
    const boardJoinLinkOrmRepo = AppDataSource.getRepository(BoardJoinLink);
    const boardJoinLinkRepository = new BoardJoinLinkRepository(boardJoinLinkOrmRepo);
    const boardMemberOrmRepo = AppDataSource.getRepository(BoardMember);
    const boardMemberRepository = new BoardMemberRepository(boardMemberOrmRepo);
    const userOrmRepo = AppDataSource.getRepository(User);
    const userRepository = new UserRepository(userOrmRepo);
    const rbacService = new RbacService();
    const workspaceService = new WorkspaceService(workspaceRepository, workspaceMemberRepository, boardRepository, roleRepository, rbacService);
    const workspaceRoleService = new WorkspaceRoleService(roleRepository, permissionRepository, rolePermissionRepository, rbacService);
    const boardService = new BoardService(boardRepository, workspaceRepository, boardJoinLinkRepository, boardMemberRepository, roleRepository, userRepository);
    const workspaceController = new WorkspaceController(workspaceService, boardService, workspaceRoleService);

    registerWorkspacePaths();
    mainRouter.use('/workspaces', workspaceRouter(workspaceController));
}
const initJoinLinkModule = () => {
    const joinLinkOrmRepo = AppDataSource.getRepository(WorkspaceJoinLink);
    const workspaceOrmRepo = AppDataSource.getRepository(Workspace);
    const workspaceMemberOrmRepo = AppDataSource.getRepository(WorkspaceMember);
    const roleOrmRepo = AppDataSource.getRepository(Role);
    const joinLinkRepository = new JoinLinkRepository(joinLinkOrmRepo);
    const workspaceRepository = new WorkspaceRepository(workspaceOrmRepo);
    const workspaceMemberRepository = new WorkspaceMemberRepository(workspaceMemberOrmRepo);
    const roleRepository = new RoleRepository(roleOrmRepo);
    const rbacService = new RbacService();
    const joinLinkService = new JoinLinkService(joinLinkRepository, workspaceRepository, workspaceMemberRepository, roleRepository, rbacService);
    const joinLinkController = new JoinLinkController(joinLinkService);

    registerJoinLinkPaths();
    mainRouter.use('/workspaces', joinLinkRouter(joinLinkController))
}
const initBoardModule = () => {
    const boardOrmRepo = AppDataSource.getRepository(Board);
    const boardRepository = new BoardRepository(boardOrmRepo);
    const listOrmRepo = AppDataSource.getRepository(List);
    const listRepository = new ListRepository(listOrmRepo);
    const cardOrmRepo = AppDataSource.getRepository(Card);
    const cardRepository = new CardRepository(cardOrmRepo);
    const workspaceOrmRepo = AppDataSource.getRepository(Workspace);
    const workspaceRepository = new WorkspaceRepository(workspaceOrmRepo);
    const boardJoinLinkOrmRepo = AppDataSource.getRepository(BoardJoinLink);
    const boardJoinLinkRepository = new BoardJoinLinkRepository(boardJoinLinkOrmRepo);
    const boardMemberOrmRepo = AppDataSource.getRepository(BoardMember);
    const boardMemberRepository = new BoardMemberRepository(boardMemberOrmRepo);
    const roleOrmRepo = AppDataSource.getRepository(Role);
    const roleRepository = new RoleRepository(roleOrmRepo);
    const userOrmRepo = AppDataSource.getRepository(User);
    const userRepository = new UserRepository(userOrmRepo);
    const boardService = new BoardService(
        boardRepository,
        workspaceRepository,
        boardJoinLinkRepository,
        boardMemberRepository,
        roleRepository,
        userRepository
    );
    const listService = new ListService(
        listRepository,
        boardRepository,
        cardRepository,
        AppDataSource
    )
    const boardController = new BoardController(boardService, listService);
    registerBoardPaths();
    mainRouter.use('/boards', boardRouter(boardController))
}
const initListModule = () => {
    const listOrmRepo = AppDataSource.getRepository(List);
    const listRepository = new ListRepository(listOrmRepo);
    const boardOrmRepo = AppDataSource.getRepository(Board);
    const boardRepository = new BoardRepository(boardOrmRepo);
    const cardOrmRepo = AppDataSource.getRepository(Card);
    const cardRepository = new CardRepository(cardOrmRepo);
    const userOrmRepo = AppDataSource.getRepository(User);
    const userRepository = new UserRepository(userOrmRepo);
    const boardMemberOrmRepo = AppDataSource.getRepository(BoardMember);
    const boardMemberRepository = new BoardMemberRepository(boardMemberOrmRepo);
    const cardMemberOrmRepo = AppDataSource.getRepository(CardMember);
    const cardMemberRepository = new CardMemberRepository(cardMemberOrmRepo);
    const listService = new ListService(
        listRepository,
        boardRepository,
        cardRepository,
        AppDataSource
    )
    const cardService = new CardService(cardRepository, listRepository, boardRepository, userRepository, boardMemberRepository, cardMemberRepository, AppDataSource)
    registerListPaths();
    const listController = new ListController(listService, cardService);
    mainRouter.use('/lists', listRouter(listController))
}
const initCardModule = () => {
    const listOrmRepo = AppDataSource.getRepository(List);
    const listRepository = new ListRepository(listOrmRepo);
    const boardOrmRepo = AppDataSource.getRepository(Board);
    const boardRepository = new BoardRepository(boardOrmRepo);
    const cardOrmRepo = AppDataSource.getRepository(Card);
    const cardRepository = new CardRepository(cardOrmRepo);
    const userOrmRepo = AppDataSource.getRepository(User);
    const userRepository = new UserRepository(userOrmRepo);
    const boardMemberOrmRepo = AppDataSource.getRepository(BoardMember);
    const boardMemberRepository = new BoardMemberRepository(boardMemberOrmRepo);
    const cardMemberOrmRepo = AppDataSource.getRepository(CardMember);
    const cardMemberRepository = new CardMemberRepository(cardMemberOrmRepo);
    const cardService = new CardService(cardRepository, listRepository, boardRepository, userRepository, boardMemberRepository, cardMemberRepository, AppDataSource)
    const cardController = new CardController(cardService);
    registerCardPaths();

    mainRouter.use('/cards', cardRouter(cardController))
}
const initActivityModule = () => {

}
initHealthCheckModule();
initAuthModule();
initUserModule();
initWorkspaceModule();
initJoinLinkModule();
initBoardModule();
initListModule();
initCardModule();
export default mainRouter;
