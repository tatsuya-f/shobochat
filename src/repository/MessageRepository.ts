import { EntityRepository, Repository } from "typeorm";
import { MessageEntity } from "../entities/MessageEntity";
import { Message } from "../Message";

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

    /*
    insertAndGetId(userId, testMessage) {
    }
    */
}
