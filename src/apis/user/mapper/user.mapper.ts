import { User } from "@/common/entities/user.entity";
import { UserResponse } from "../schemas";

export const toUserResponse = (user: User): UserResponse => ({
    id: user.id,
    fullname: user.fullname,
    username: user.username,
    email: user.email,
    googleId: user.googleId,
    avatarUrl: user.avatarUrl,
    description: user.description,
    isActive: user.isActive,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
});
