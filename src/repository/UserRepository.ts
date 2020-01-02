import { EntityRepository, Repository } from "typeorm";
import { UserEntity } from "../entities/UserEntity";
import { User } from "../User";

@EntityRepository()
export class UserRepository extends Repository<UserEntity> {

    findByName(name: string): Promise<User> {
        return this.createQueryBuilder("user")
            .where("user.name = :name", { name })
            .getOne();
    }
}
