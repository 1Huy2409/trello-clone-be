import { IPermissionRepository } from "./repositories/permission.repository.interface";
import { Permission } from "@/common/entities/permission.entity";

export class PermissionService {
    constructor(
        private readonly permissionRepository: IPermissionRepository
    ) { }

    async findAll(): Promise<Permission[]> {
        return await this.permissionRepository.findAll();
    }
}
