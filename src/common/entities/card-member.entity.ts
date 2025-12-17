import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { DateTimeEntity } from "./base/date-time.entity";
import { Card } from "./card.entity";
import { User } from "./user.entity";

@Entity('card-members')
@Unique(['cardId', 'userId'])
export class CardMember extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    cardId: string

    @Column({ type: 'uuid' })
    userId: string

    @ManyToOne(() => Card, (card) => card.cardMembers, { onDelete: 'CASCADE' })
    card: Card

    @ManyToOne(() => User, (user) => user.cardMembers)
    user: User
}