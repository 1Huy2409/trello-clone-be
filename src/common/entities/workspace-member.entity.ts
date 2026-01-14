import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.entity";
import { Workspace } from "./workspace.entity";
import { DateTimeEntity } from "./base/date-time.entity";
import { Role } from "./role.entity";

@Entity('workspace-members')
@Unique(['workspace', 'user'])
export class WorkspaceMember extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ type: 'uuid' })
    workspaceId: string

    @Column({ type: 'uuid' })
    roleId: string

    @ManyToOne(() => Role, { onDelete: "RESTRICT" })
    @JoinColumn({ name: 'roleId' })
    role: Role

    @ManyToOne(() => User, (user) => user.workspaceMembers)
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(() => Workspace, (workspace) => workspace.workspaceMembers, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'workspaceId' })
    workspace: Workspace

}