import { redisCache } from "@/config/redis.config";
import { Membership } from "./types";
export class RbacCacheService {
    private readonly TTL = {
        DECISION: 3600,
        MEMBERSHIP: 3600,
        OWNERSHIP: 3600,
    }

    constructor() { }

    // caching layer 1
    cachePermissionCheck = async (
        userId: string,
        permission: string,
        context: { workspaceId?: string; boardId?: string },
        result: boolean
    ): Promise<void> => {
        try {
            const key = this.buildPermissionKey(userId, permission, context);
            await redisCache.setex(key, this.TTL.DECISION, result ? "1" : "0");
        }
        catch (err) {
            console.error("Error caching permission check:", err);
        }
    }
    getCachePermissionCheck = async (
        userId: string,
        permission: string,
        context: { workspaceId?: string; boardId?: string }
    ): Promise<boolean | null> => {
        try {
            const key = this.buildPermissionKey(userId, permission, context);
            const cached = await redisCache.get(key)
            if (cached === null) return null;
            return cached === "1";
        }
        catch (err) {
            console.error("Error getting cached permission check:", err);
            return null;
        }
    }

    // caching layer 2 (save role + permissions into membership)
    cacheMembership = async (
        userId: string,
        context: { workspaceId?: string; boardId?: string },
        memberships: Membership[]
    ): Promise<void> => {
        try {
            const key = this.buildMembershipKey(userId, context);
            await redisCache.setex(key, this.TTL.MEMBERSHIP, JSON.stringify(memberships));
        }
        catch (err) {
            console.error("Error caching membership:", err);
        }
    }
    getCacheMembership = async (
        userId: string,
        context: { workspaceId?: string; boardId?: string }
    ): Promise<Membership[] | null> => {
        try {
            const key = this.buildMembershipKey(userId, context);
            const cached = await redisCache.get(key)
            if (!cached) return null;
            return JSON.parse(cached) as Membership[];
        }
        catch (err) {
            console.error("Error getting cached membership:", err);
            return null;
        }
    }

    // ownership caching (workspace first)
    cacheWorkspaceOwner = async (
        userId: string,
        workspaceId: string,
        isOwner: boolean
    ): Promise<void> => {
        try {
            const key = this.buildOwnershipKey(userId, workspaceId, 'workspace');
            await redisCache.setex(key, this.TTL.OWNERSHIP, isOwner ? "1" : "0");
        }
        catch (err) {
            console.error("Error caching workspace owner:", err);
        }
    }
    getCacheWorkspaceOwner = async (userId: string, workspaceId: string): Promise<boolean | null> => {
        try {
            const key = this.buildOwnershipKey(userId, workspaceId, 'workspace');
            const cached = await redisCache.get(key);
            if (cached === null) return null;
            return cached === "1";
        }
        catch (err) {
            console.error("Error getting cached workspace owner:", err);
            return null;
        }
    }

    // cache invalidation
    invalidateUserWorkspace = async (userId: string, workspaceId: string): Promise<void> => {
        try {
            const patterns = [
                `rbac:user:${userId}:workspace:${workspaceId}:permission:*`,
                `rbac:membership:${userId}:workspace:${workspaceId}:board:*`,
                `rbac:ownership:${userId}:workspace:${workspaceId}`
            ]
            await Promise.all(patterns.map(pattern => this.deleteByPattern(pattern)));
            console.log(`Invalidated RBAC cache for user ${userId} in workspace ${workspaceId}`);
        }
        catch (err) {
            console.error("Error invalidating user-workspace cache:", err);
        }
    }
    invalidateUserBoard = async (userId: string, boardId: string): Promise<void> => {
        try {
            const patterns = [
                `rbac:user:${userId}:board:${boardId}:permission:*`,
                `rbac:membership:${userId}:workspace:*:board:${boardId}`,
                `rbac:ownership:${userId}:board:${boardId}`
            ]
            await Promise.all(patterns.map(pattern => this.deleteByPattern(pattern)));
            console.log(`Invalidated RBAC cache for user ${userId} in board ${boardId}`);
        }
        catch (err) {
            console.error("Error invalidating user-board cache:", err);
        }
    }

    async invalidateUser(userId: string): Promise<void> {
        try {
            const pattern = `rbac:*:${userId}:*`;
            await this.deleteByPattern(pattern);
            console.log(`Invalidated all RBAC cache for user ${userId}`);
        }
        catch (err) {
            console.error("Error invalidating user cache:", err);
        }
    }

    invalidateWorkspace = async (workspaceId: string): Promise<void> => {
        try {
            const patterns = [
                `rbac:user:*:workspace:${workspaceId}:permission:*`,
                `rbac:membership:*:workspace:${workspaceId}:board:*`,
                `rbac:ownership:*:workspace:${workspaceId}`
            ]
            await Promise.all(patterns.map(pattern => this.deleteByPattern(pattern)));
            console.log(`Invalidated RBAC cache for workspace ${workspaceId}`);
        }
        catch (err) {
            console.error("Error invalidating workspace cache:", err);
        }
    }
    invalidateBoard = async (boardId: string): Promise<void> => {
        try {
            const patterns = [
                `rbac:user:*:board:${boardId}:permission:*`,
                `rbac:membership:*:workspace:*:board:${boardId}`,
                `rbac:ownership:*:board:${boardId}`
            ]
            await Promise.all(patterns.map(pattern => this.deleteByPattern(pattern)));
            console.log(`Invalidated RBAC cache for board ${boardId}`);
        }
        catch (err) {
            console.error("Error invalidating board cache:", err);
        }
    }

    // Key builders
    private buildPermissionKey(
        userId: string,
        permission: string,
        context: { workspaceId?: string; boardId?: string }
    ): string {
        const { workspaceId, boardId } = context;
        if (boardId) {
            return `rbac:user:${userId}:board:${boardId}:permission:${permission}`;
        }
        if (workspaceId) {
            return `rbac:user:${userId}:workspace:${workspaceId}:permission:${permission}`;
        }
        return `rbac:user:${userId}:global:permission:${permission}`;
    }
    private buildMembershipKey(
        userId: string,
        context: { workspaceId?: string; boardId?: string }
    ): string {
        const { workspaceId, boardId } = context;
        return `rbac:membership:${userId}:workspace:${workspaceId || "null"}:board:${boardId || "null"}`;
    }
    private buildOwnershipKey(
        userId: string,
        resourceId: string,
        resourceType: 'workspace' | 'board' | 'global',
    ): string {
        const prefix = resourceType === 'workspace' ? 'workspace' : 'board';
        return `rbac:ownership:${userId}:${prefix}:${resourceId}`;
    }

    // delete cache by pattern here
    private async deleteByPattern(pattern: string): Promise<number> {
        let cursor = '0';
        let deletedCount = 0;

        do {
            // SCAN instead of KEYS để không block Redis
            const [newCursor, keys] = await redisCache.scan(
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                100
            );

            cursor = newCursor;

            if (keys.length > 0) {
                await redisCache.del(...keys);
                deletedCount += keys.length;
            }
        } while (cursor !== '0');

        return deletedCount;
    }
}