import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ChannelEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "text",
        unique: true,
        nullable: false
    })
    name!: string;
}
