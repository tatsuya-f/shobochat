import { EntityManager, EntityRepository } from "typeorm";
import { UserEntity } from "../entity/UserEntity";
import { User } from "../../common/User";

@EntityRepository()
export class UserRepository {

    /*
     * getCustomRepository を使って
     * TypeORM 側で初期化すること
     */
    constructor(private manager: EntityManager) {}

    async getById(userId: number): Promise<User> {
        const user = await this.manager.createQueryBuilder(UserEntity, "user")
            .where("user.id = :id", { id: userId  })
            .getOne();

        if (user === undefined) { // 参考：https://stackoverflow.com/questions/42453683/how-to-reject-in-async-await-syntax
            throw new Error("not found");
        } else {
            return user;
        }
    }

    async getByName(name: string): Promise<User> {
        const user = await this.manager.createQueryBuilder(UserEntity, "user")
            .where("user.name = :name", { name })
            .getOne();

        if (user === undefined) { // 参考：https://stackoverflow.com/questions/42453683/how-to-reject-in-async-await-syntax
            throw new Error("not found");
        } else {
            return user;
        }
    }

    async hasName(name: string): Promise<boolean> {
        const user = await this.manager.createQueryBuilder(UserEntity, "user")
            .where("user.name = :name", { name })
            .getOne();

        return !!user;
    }

    // insert された user の user id をプロミスに入れて返す
    async insertAndGetId(name: string, password: string): Promise<number> {
        const insertResult = await this.manager.createQueryBuilder()
            .insert()
            .into(UserEntity)
            .values([
                { name, password }
            ])
            .execute();

        if (insertResult === undefined) {
            throw new Error("insert failed");
        } else {
            return insertResult.identifiers[0].id;
        }
    }

    async updateById(userId: number, name: string, password: string): Promise<void> {
        const updateResult = await this.manager.createQueryBuilder()
            .update(UserEntity)
            .set({ name, password })
            .where("id = :id", { id: userId })
            .execute();

        if (updateResult === undefined) {
            throw new Error("update failed");
        }
    }

    async getEntityById(userId: number): Promise<UserEntity> {
        const userEntity = await this.manager.findOne(UserEntity, { where: { id: userId } });

        if (userEntity !== undefined) {
            return userEntity;
        } else {
            throw new Error("not found");
        }
    }

    create() {
        return this.manager.create(UserEntity);
    }

    async save(userEntity: UserEntity) {
        await this.manager.save(userEntity);
    }

    getId(userEntity: UserEntity) {
        return this.manager.getId(userEntity); 
    }
}
