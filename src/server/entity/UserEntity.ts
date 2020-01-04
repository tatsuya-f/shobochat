import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/* 
 * <各プロパティに!がついていることについて>
 * typeorm の仕様によって，各プロパティは
 * Entity の方で初期化されるが，
 * トランスパイル時に，! をつけていないプロパティ
 * は初期化を User クラス内で行わないとエラーが出る(トランスパイラをstrictにしてるため）
 * そのため，各プロパティに ! をつける
 * ! はこの変数は絶対にnullにならないことをトランスパイラに
 * 伝える役割がある(正確には型<T | undefined | null>を型<T>に静的にcastしている）
 * 参考：https://github.com/typeorm/typeorm/issues/3903
 *
 */
@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "text",
        unique: true,
        nullable: false
    })
    name!: string;

    @Column({
        type: "text",
        nullable: false
    })
    password!: string;
}
