import { getConnection, EntityRepository, Repository } from "typeorm";
import * as uuid from "uuid";
import { UserRepository } from "../repository/UserRepository";
import { ChannelRepository } from "../repository/ChannelRepository";
import { MessageEntity } from "../entity/MessageEntity";
import { Message } from "../../common/Message";

const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";

@EntityRepository(MessageEntity)
export class MessageRepository extends Repository<MessageEntity> {

    private toMessage(messageEntity: MessageEntity): Message {
        const message: Message = {
            id: messageEntity.id,
            userId: messageEntity.user.id,
            channelName: messageEntity.channel.name,
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
            .innerJoinAndSelect("message.channel", "channel")
            .where("message.id = :id", { id: messageId })
            .getOne();
        if (messageEntity === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessage(messageEntity);
        }
    }

    public async getAll(channelName: string): Promise<Array<Message>> {
        const messageEntitys = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .innerJoinAndSelect("message.channel", "channel")
            .where("message.channel.name = :channelName", { channelName })
            .orderBy("time", "DESC")
            .getMany();

        if (messageEntitys === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntitys);
        }
    }

    public async getBeforeSpecifiedTime(channelName: string, fromTime: number, n: number): Promise<Array<Message>> {
        const messageEntities = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .innerJoinAndSelect("message.channel", "channel")
            .where("time < :time AND message.channelName = :channelName", {
                time: fromTime,
                channelName
            })
            .orderBy("time", "DESC")
            .limit(n)
            .getMany();

        if (messageEntities === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntities);
        }
    }

    public async getAllAfterSpecifiedTime(channelName: string, fromTime: number): Promise<Array<Message>> {
        const messageEntities = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .innerJoinAndSelect("message.channel", "channel")
            .where("time > :time AND message.channelName = :channelName", {
                time: fromTime,
                channelName
            })
            .orderBy("time", "DESC")
            .getMany();

        if (messageEntities === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntities);
        }
    }

    public async getAllByTime(channelName: string, time: number): Promise<Array<Message>> {
        const messageEntities = await this.createQueryBuilder("message")
            .innerJoinAndSelect("message.user", "user") // message.user を user に aliasing
            .innerJoinAndSelect("message.channel", "channel")
            .where("time = :time AND message.channelName = :channelName", {
                time,
                channelName
            })
            .getMany();

        if (messageEntities === undefined) {
            throw new Error("not found");
        } else {
            return this.toMessages(messageEntities);
        }
    }

    public async insertAndGetId(channelName: string, userId: number, content: string): Promise<string> {
        const userRepository = getConnection(connectionType)
            .getCustomRepository(UserRepository);
        const channelRepository = getConnection(connectionType)
            .getCustomRepository(ChannelRepository);

        const messageEntity: MessageEntity = this.create(); // const messageEntity = new MessageEntity() と同じ
        await new Promise(resolve => setTimeout(resolve, 1));
        messageEntity.id = uuid.v4();
        messageEntity.time = Date.now();
        messageEntity.content = content;
        messageEntity.user = await userRepository.getEntityById(userId);
        messageEntity.channel = await channelRepository.getByName(channelName);
        await this.save(messageEntity);

        const messageId = this.getId(messageEntity);
        return messageId;
    }

    public async updateById(messageId: string, content: string): Promise<void> {
        await this.createQueryBuilder("message")
            .update(MessageEntity)
            .set({ content })
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
