import { EntityRepository, Repository } from "typeorm";
import { UserEntity } from "../entities/UserEntity";
import { User } from "../User";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {

    public async getByName(name: string): Promise<User> {
        const user = await this.createQueryBuilder("user")
            .where("user.name = :name", { name })
            .getOne();

        if (user === undefined) { // 参考：https://stackoverflow.com/questions/42453683/how-to-reject-in-async-await-syntax
            throw new Error("not found");
        } else {
            return user;
        }
    }

    public async hasName(name: string): Promise<boolean> {
        const user = await this.createQueryBuilder("user")
            .where("user.name = :name", { name })
            .getOne();

        return !!user;
    }

    // insert された user の user id をプロミスに入れて返す
    public async insertAndGetId(name: string, password: string): Promise<number> {
        const insertResult = await this.createQueryBuilder()
            .insert()
            .into(UserEntity)
            .values([
                { name: name, password: password }
            ])
            .execute();

        if (insertResult === undefined) { 
            throw new Error("insert failed");
        } else {
            return insertResult.identifiers[0].id;
        }
    }

    public async updateNameAndPassword(userId: number, name: string, password: string): Promise<void> {
        const updateResult = await this.createQueryBuilder()
            .update(UserEntity)
            .set({ name: name, password: password})
            .where("id = :id", { id: userId })
            .execute();

        if (updateResult === undefined) {
            throw new Error("update failed");
        }
    }

    public async getEntityById(userId: number): Promise<UserEntity> {
        const userEntity = await this.findOne({ where: { id: userId } });

        if (userEntity !== undefined) {
            return userEntity;
        } else {
            throw new Error("not found");
        }
    }
}
