import {
    Connection,
    ConnectionOptions,
    createConnection,
    getConnection,
    getCustomRepository
} from "typeorm";
import { ChannelEntity } from "../src/server/entity/ChannelEntity";
import { ChannelRepository } from "../src/server/repository/ChannelRepository";
import * as assert from "assert";
import * as fs from "fs";
import { Channel, isChannel } from "../src/common/Channel";

const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";
const channelName = "test-chan";

function deleteDB() {
    try {
        fs.unlinkSync("testDB");
    } catch (err) {
        console.log(err);
    }
}

describe("getById", () => {
    let connection: Connection;
    let channelRepository: ChannelRepository;
    let chanId: number;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);

            const chan = channelRepository.create(); // const user = new UserEntity() と同じ
            chan.name = channelName;
            await channelRepository.save(chan);
            chanId = channelRepository.getId(chan);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns User object", async () => {
        const testChan = await channelRepository.getById(chanId);
        assert.strictEqual(isChannel(testChan), true);
        assert.strictEqual(testChan.id, chanId);
        assert.strictEqual(testChan.name, channelName);
    });
});

describe("getByName", () => {
    let connection: Connection;
    let channelRepository: ChannelRepository;
    let chanId: number;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);

            const chan = channelRepository.create(); // const user = new UserEntity() と同じ
            chan.name = channelName;
            await channelRepository.save(chan);
            chanId = channelRepository.getId(chan);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns User object", async () => {
        const testChan = await channelRepository.getByName(channelName);
        assert.strictEqual(isChannel(testChan), true);
        assert.strictEqual(testChan.id, chanId);
        assert.strictEqual(testChan.name, channelName);
    });
});

describe("hasName", () => {
    let connection: Connection;
    let channelRepository: ChannelRepository;
    const chanName = "test-chan";

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);

            const channel = channelRepository.create();
            channel.name = chanName;
            await channelRepository.save(channel);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("return true when channel exists", async () => {
        assert.strictEqual(await channelRepository.hasName(chanName), true);
    });
    it("returns false when channel doesn't exist", async () => {
        assert.strictEqual(await channelRepository.hasName("not exsit"), false);
    });
});

describe("insertAndGetId", () => {
    let connection: Connection;
    let channelRepository: ChannelRepository;
    const testChan1 = "test-chan1";
    const testChan2 = "test-chan2";

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns id of inserted channel", async () => {
        const id = await channelRepository.insertAndGetId(testChan1);
        const id2 = await channelRepository.insertAndGetId(testChan2);
        const testChannel = await channelRepository.getByName(testChan1);
        const testChannel2 = await channelRepository.getByName(testChan2);

        if (testChannel) {
            assert.strictEqual(id === testChannel.id, true);
            assert.strictEqual(id2 === testChannel2.id, true);
        } else {
            assert.strictEqual(testChannel === undefined, false);
        }
    });
});

describe("getEntityById", () => {
    let connection: Connection;
    let channelRepository: ChannelRepository;
    let channelId: number;
    const chanName = "test-chan";

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);

            const channelEntity = channelRepository.create();
            channelEntity.name = chanName;
            await channelRepository.save(channelEntity);
            channelId = channelRepository.getId(channelEntity);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns ChannelEntity object", async () => {
        const channelEntity = await channelRepository.getEntityById(channelId);
        assert.strictEqual(channelEntity.id, channelId);
        assert.strictEqual(channelEntity.name, chanName);
    });
});
