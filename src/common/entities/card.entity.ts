import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import { DateTimeEntity } from "./base/date-time.entity";
import { List } from "./list.entity";
import { Comment } from "./comment.entity";
import { CardMember } from "./card-member.entity";

@Entity('cards')
export class Card extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'numeric',
        precision: 20,
        scale: 10,
    })
    position: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    coverUrl: string;

    @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
    priority: 'low' | 'medium' | 'high';

    @Column({ name: 'dueDate', type: 'date', nullable: true })
    dueDate: Date;

    @Column({ type: 'boolean', default: false })
    isArchived: boolean;

    @Column({ type: 'uuid' })
    boardId: string

    @Column({ type: 'uuid' })
    listId: string

    @OneToMany(() => Comment, (comment) => comment.card)
    comments: Comment[]

    @OneToMany(() => CardMember, (cardMember) => cardMember.card)
    cardMembers: CardMember[]

    @ManyToOne(() => List, (list) => list.cards, { onDelete: 'CASCADE' })
    list: List
}