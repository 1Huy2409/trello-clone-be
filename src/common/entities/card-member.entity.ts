import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DateTimeEntity } from "./base/date-time.entity";
import { Card } from "./card.entity";
import { User } from "./user.entity";

@Entity('card-members')
export class CardMember extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'int' })
    role: number

    @Column({ type: 'uuid' })
    cardId: string

    @ManyToOne(() => Card, (card) => card.cardMembers)
    card: Card

    @ManyToOne(() => User, (user) => user.cardMembers)
    user: User
}