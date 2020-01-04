import { getConnection, EntityRepository, Repository } from "typeorm";
import * as uuid from "uuid";
import { UserRepository } from "../repository/UserRepository";
import { MessageEntity } from "../entity/MessageEntity";
import { Message } from "../../common/Message";

const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";

@EntityRepository(MessageEntity)
export class MessageRepository extends Repository<MessageEntity> {

    private toMessage(messageEntity: MessageEntity): Message {
        const message: Message = {
            id: messageEntity.id,
            userId: messageEntity.user.id,
            time: messageEntity.time,
            name: messageEntity.user.name,
            content: messageEntity.content
        };
        return message;
    }

    private toMessages(messageEntitys: Array<MessageEntity>): Array<Message> {
        return messageEntitys.map(messageEntity => this.toMessage(messageEntity));
    }

    public async getById(messageId: string): Promise<Message> {
        const messageEntity = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .where("message.id = :id", { id: messageId })
            .getOne();

        if (messageEntity === undefined) { 
            throw new Error("not found");
        } else {
            return this.toMessage(messageEntity);
        }
    }

    public async getAll(): Promise<Array<Message>> {
        const messageEntitys = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .orderBy("time", "DESC")
            .getMany();

        if (messageEntitys === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntitys);
        }
    }

    public async getBeforeSpecifiedTime(fromTime: number, n: number): Promise<Array<Message>> {
        const messageEntitys = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .where("time < :time", { time: fromTime })
            .orderBy("time", "DESC")
            .limit(n)
            .getMany();

        if (messageEntitys === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntitys);
        }
    }

    public async getAllAfterSpecifiedTime(fromTime: number): Promise<Array<Message>> {
        const messageEntitys = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .where("time > :time", { time: fromTime })
            .orderBy("time", "DESC")
            .getMany();

        if (messageEntitys === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntitys);
        }
    }

    public async getAllByTime(time: number): Promise<Array<Message>> {
        const messageEntitys = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .where("time = :time", { time: time })
            .getMany();

        if (messageEntitys === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntitys);
        }
    }

    public async insertAndGetId(userId: number, content: string): Promise<string> {
        const userRepository = getConnection(connectionType)
            .getCustomRepository(UserRepository); 

        const messageEntity: MessageEntity = this.create(); // const messageEntity = new MessageEntity() と同じ
        messageEntity.id = uuid.v4();
        messageEntity.time = Date.now();
        messageEntity.content = content;
        messageEntity.user = await userRepository.getEntityById(userId);
        await this.save(messageEntity);

        const messageId = this.getId(messageEntity);
        return messageId;
    }

    public async updateById(messageId: string, content: string): Promise<void> {
        await this.createQueryBuilder("message")
            .update(MessageEntity)
            .set({ content: content })
            .where("id = :id", { id: messageId })
            .execute();
    }

    public async deleteById(messageId: string): Promise<void> {
        await this.createQueryBuilder("message")
            .delete()
            .from(MessageEntity)
            .where("id = :id", { id: messageId })
            .execute();
    }
}
