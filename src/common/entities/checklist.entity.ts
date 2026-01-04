import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DateTimeEntity } from "./base/date-time.entity";
import { Card } from "./card.entity";
import { ChecklistItem } from "./checklist-item.entity";

@Entity('checklists')
export class Checklist extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({
        type: 'numeric',
        precision: 20,
        scale: 10,
    })
    position: string;

    @Column({ type: 'uuid' })
    cardId: string;

    @ManyToOne(() => Card, { onDelete: 'CASCADE' })
    card: Card;

    @OneToMany(() => ChecklistItem, (item) => item.checklist)
    items: ChecklistItem[];
}