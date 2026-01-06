import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { DateTimeEntity } from "./base/date-time.entity";

@Entity('attachments')
export class Attachment extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    cardId: string

    @Column({ type: 'varchar', length: 255 })
    file_url: string

    @Column({ type: 'varchar', length: 255 })
    file_name: string

    @Column({ type: 'varchar', length: 255 })
    file_type: string

    @Column({ type: 'varchar', length: 255 })
    public_id: string
}