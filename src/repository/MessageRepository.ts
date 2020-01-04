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
        let messages: Array<Message> = new Array(messageEntitys.length);
        messageEntitys.forEach((messageEntity => {
            messages.push(this.toMessage(messageEntity));
        }));
        return messages;
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
            .getMany();

        if (messageEntitys === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntitys);
        }
    }

    /*
    public async getBefore(fromTime: number, n: number): Promise<Array<Message>> {
        const messageEntitys = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .where("time < :time", { time: fromTime })
            .orderBy("time", "DESC")
            .limit(n)
            .getMany();

        if (messageEntitys === undefined) {
            throw new Error("not found");
        } else {
            let messages: Array<Message> = new Array(messageEntitys.length);
            messageEntitys.forEach((m => {
                const message: Message = {
                    id: m.id,
                    userId: m.user.id,
                    time: m.time,
                    name: m.user.name,
                    content: m.content
                };
                messages.push(message);
            }));
            return messages;
        }
    }
    */

    /*
    insertAndGetId(userId, testMessage) {
    }
    */
}
