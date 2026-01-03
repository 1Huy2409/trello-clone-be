import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DateTimeEntity } from "./base/date-time.entity";
import { Checklist } from "./checklist.entity";

@Entity('checklist-items')
export class ChecklistItem extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    content: string;

    @Column({ type: 'boolean', default: false })
    isCompleted: boolean;

    @Column({
        type: 'numeric',
        precision: 20,
        scale: 10,
    })
    position: string;

    @Column({ type: 'uuid' })
    checklistId: string;
    
    @ManyToOne(() => Checklist, (checklist) => checklist.items, { onDelete: 'CASCADE' })
    checklist: Checklist;
}