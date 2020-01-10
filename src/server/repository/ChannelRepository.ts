import { EntityRepository, Repository } from "typeorm";
import { ChannelEntity } from "../entity/ChannelEntity";
import { Channel } from "../../common/Channel";

@EntityRepository(ChannelEntity)
export class ChannelRepository extends Repository<ChannelEntity> {

    private toChannel(channelEntity: ChannelEntity): Channel {
        const channel = {
            id: channelEntity.id,
            name: channelEntity.name
        };
        return channel;
    }

    private toChannels(channelEntities: Array<ChannelEntity>): Array<Channel> {
        return channelEntities.map(channelEntity => this.toChannel(channelEntity));
    }

    public async getAll() {
        const channelEntities = await this.createQueryBuilder("channel")
            .orderBy("name", "ASC")
            .getMany();
        if (channelEntities === undefined) {
            throw new Error("not found");
        } else {
            return this.toChannels(channelEntities);
        }
    }

    public async getById(channelId: number): Promise<Channel> {
        const channelEntity = await this.createQueryBuilder("channel")
            .where("channel.id = :id", { id: channelId })
            .getOne();

        if (channelEntity === undefined) {
            throw new Error("not found");
        } else {
            return this.toChannel(channelEntity);
        }
    }


    public async getByName(name: string): Promise<Channel> {
        const channel = await this.createQueryBuilder("channel")
            .where("channel.name = :name", { name })
            .getOne();

        if (channel === undefined) {
            throw new Error("not found");
        } else {
            return channel;
        }
    }

    public async insertAndGetId(name: string): Promise<number> {
        const insertResult = await this.createQueryBuilder()
            .insert()
            .into(ChannelEntity)
            .values([{ name }])
            .execute();
        if (insertResult === undefined) {
            throw new Error("insert failed");
        } else {
            return insertResult.identifiers[0].id;
        }
    }

    public async hasName(name: string): Promise<boolean> {
        const channel = await this.createQueryBuilder("channel")
            .where("channel.name = :name", { name })
            .getOne();

        return !!channel;
    }

    public async getEntityById(channelId: number): Promise<ChannelEntity> {
        const channelEntity = await this.findOne({ where: { id: channelId } });

        if (channelEntity !== undefined) {
            return channelEntity;
        } else {
            throw new Error("not found");
        }
    }
}
