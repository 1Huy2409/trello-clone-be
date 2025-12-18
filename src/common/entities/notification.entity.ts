import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { DateTimeEntity } from "./base/date-time.entity";
import { EventType } from "../events/interface";

@Entity('notifications')
export class Notification extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ type: 'enum', enum: EventType })
    type: EventType

    @Column({ type: 'jsonb', nullable: true })
    payload: Record<string, any> | null;

    @Column({ name: 'isRead', type: 'boolean', default: false })
    isRead: boolean;

    @ManyToOne(() => User, (user) => user.notifications)
    user: User
}