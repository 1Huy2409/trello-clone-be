import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.entity";
import { Board } from "./board.entity";
import { DateTimeEntity } from "./base/date-time.entity";
import { Role } from "./role.entity";

@Entity('board-members')
@Unique(['board', 'user'])
export class BoardMember extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ type: 'uuid' })
    boardId: string

    @Column({ type: 'uuid' })
    roleId: string

    @ManyToOne(() => Role, { onDelete: "RESTRICT" })
    role: Role

    @ManyToOne(() => User, (user) => user.boardMembers)
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(() => Board, (board) => board.boardMembers, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'boardId' })
    board: Board
}