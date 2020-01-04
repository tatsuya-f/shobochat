import { EntityRepository, Repository } from "typeorm";
import { MessageEntity } from "../entities/MessageEntity";
import { Message } from "../Message";

@EntityRepository(MessageEntity)
export class MessageRepository extends Repository<MessageEntity> {

    async getById(messageId: string): Promise<Message> {
        const messageEntity = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .where("message.id = :id", { id: messageId })
            .getOne();

        if (messageEntity === undefined) { 
            throw new Error("not found");
        } else {
            const message: Message = {
                id: messageEntity.id,
                userId: messageEntity.user.id,
                time: messageEntity.time,
                name: messageEntity.user.name,
                content: messageEntity.content
            };
            return message;
        }
    }

    async getAll(): Promise<Array<Message>> {
        const messageEntitys = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
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

    /*
    insertAndGetId(userId, testMessage) {
    }
    */
}
