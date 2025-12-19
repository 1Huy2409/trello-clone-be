import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DateTimeEntity } from "./base/date-time.entity";
import { EventType } from "../events/interface";
import { User } from "./user.entity";
import { Board } from "./board.entity";
import { Card } from "./card.entity";
import { nullable } from "zod";

@Entity('activities')
export class Activity extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    boardId: string;

    @Column({ type: 'uuid', nullable: true })
    cardId: string | null;

    @Column({ type: 'uuid' })
    actorId: string;

    @Column({ type: 'enum', enum: EventType })
    type: EventType;

    @Column({ type: 'jsonb', nullable: true })
    message: Record<string, any> | null;

    @Column({ type: 'jsonb', nullable: true })
    payload: Record<string, any> | null;

    @ManyToOne(() => User)
    actor: User;

    @ManyToOne(() => Board)
    board: Board;

    @ManyToOne(() => Card, { nullable: true })
    card: Card | null;
}   