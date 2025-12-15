import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Board } from "./board.entity";
import { DateTimeEntity } from "./base/date-time.entity";
import { Card } from "./card.entity";

@Entity('lists')
export class List extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string

    @Column({
        type: 'numeric',
        precision: 20,
        scale: 10,
    })
    position: string;

    @Column({ type: 'boolean', default: false })
    isArchived: boolean

    @Column({ type: 'uuid' })
    boardId: string

    @ManyToOne(() => Board, (board) => board.lists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'boardId' })
    board: Board

    @OneToMany(() => Card, (card) => card.list)
    cards: Card[]
}