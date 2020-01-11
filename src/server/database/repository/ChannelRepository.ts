import { EntityManager, EntityRepository } from "typeorm";
import { ChannelEntity } from "../entity/ChannelEntity";
import { Channel } from "../../../common/Channel";

@EntityRepository()
export class ChannelRepository {

    /*
     * getCustomRepository を使って
     * TypeORM 側で初期化すること
     */
    constructor(private manager: EntityManager) {}

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
        const channelEntities = await this.manager.createQueryBuilder(ChannelEntity, "channel")
            .orderBy("name", "ASC")
            .getMany();
        if (channelEntities === undefined) {
            throw new Error("not found");
        } else {
            return this.toChannels(channelEntities);
        }
    }

    public async getById(channelId: number): Promise<Channel> {
        const channelEntity = await this.manager.createQueryBuilder(ChannelEntity, "channel")
            .where("channel.id = :id", { id: channelId })
            .getOne();

        if (channelEntity === undefined) {
            throw new Error("not found");
        } else {
            return this.toChannel(channelEntity);
        }
    }


    public async getByName(name: string): Promise<Channel> {
        const channel = await this.manager.createQueryBuilder(ChannelEntity, "channel")
            .where("channel.name = :name", { name })
            .getOne();

        if (channel === undefined) {
            throw new Error("not found");
        } else {
            return channel;
        }
    }

    public async insertAndGetId(name: string): Promise<number> {
        const insertResult = await this.manager.createQueryBuilder()
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
        const channel = await this.manager.createQueryBuilder(ChannelEntity, "channel")
            .where("channel.name = :name", { name })
            .getOne();

        return !!channel;
    }

    public async getEntityById(channelId: number): Promise<ChannelEntity> {
        const channelEntity = await this.manager.findOne(ChannelEntity, { where: { id: channelId } });

        if (channelEntity !== undefined) {
            return channelEntity;
        } else {
            throw new Error("not found");
        }
    }

    create() {
        return this.manager.create(ChannelEntity);
    }

    async save(channelEntity: ChannelEntity) {
        await this.manager.save(channelEntity);
    }

    getId(channelEntity: ChannelEntity) {
        return this.manager.getId(channelEntity); 
    }
}
