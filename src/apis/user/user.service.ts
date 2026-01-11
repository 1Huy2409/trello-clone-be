import type { Express } from "express";
import { PatchUserProfileRequest, UserResponse } from "./schemas";
import { User } from "@/common/entities/user.entity";
import { BadRequestError, NotFoundError } from "@/common/handler/error.response";
import { toUserResponse } from "./mapper/user.mapper";
import { IUserRepository } from "./repositories/user.repository.interface";
import { uploadFile } from "@/common/services/cloudinary.service";

export default class UserService {
    constructor(
        private userRepository: IUserRepository
    ) {
    }
    findAll = async (): Promise<UserResponse[]> => {
        const users = await this.userRepository.findAll();
        if (!users.length) {
            throw new NotFoundError('Users are not found!')
        }
        return users.map(toUserResponse)
    }
    findById = async (id: string): Promise<UserResponse | null> => {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User with ID ${id} is not found!`)
        }
        return toUserResponse(user)
    }

    updateProfile = async (id: string, payload: PatchUserProfileRequest): Promise<UserResponse> => {
        const existing = await this.userRepository.findById(id);
        if (!existing) {
            throw new NotFoundError(`User with ID ${id} is not found!`);
        }

        const updateData: Partial<User> = Object.entries(payload)
            .reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (acc as any)[key] = value;
                }
                return acc;
            }, {} as Partial<User>);


        const updated = await this.userRepository.update(id, updateData);
        return toUserResponse(updated);
    }

    uploadAvatar = async (id: string, file: Express.Multer.File): Promise<UserResponse> => {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User with ID ${id} is not found!`);
        }
        if (!file) {
            throw new BadRequestError('Avatar file is required');
        }

        const result = await uploadFile(file, { folder: 'avatars', public_id: `user-${id}`, overwrite: true });
        const updated = await this.userRepository.update(id, { avatarUrl: result.secure_url });
        return toUserResponse(updated);
    }
}
