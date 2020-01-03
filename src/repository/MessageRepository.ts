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
        /*
        const sql = `SELECT messages.id, userId, time, name, content
                     FROM messages INNER JOIN userInfo ON messages.userId = userInfo.id
                     WHERE messages.id = ?`;
         */
    }

    /*
    insertAndGetId(userId, testMessage) {
    }
    */
}
