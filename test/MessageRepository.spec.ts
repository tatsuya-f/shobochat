import {
    Connection,
    ConnectionOptions,
    createConnection,
    getConnection,
    getCustomRepository
} from "typeorm";
import * as uuid from "uuid";
import { UserEntity } from "../src/server/entity/UserEntity";
import { ChannelEntity } from "../src/server/entity/ChannelEntity";
import { UserRepository } from "../src/server/repository/UserRepository";
import { ChannelRepository } from "../src/server/repository/ChannelRepository";
import { MessageEntity } from "../src/server/entity/MessageEntity";
import { MessageRepository } from "../src/server/repository/MessageRepository";
import * as assert from "assert";
import * as fs from "fs";
import { Message, isMessage } from "../src/common/Message";

const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";
const TEST_NAME = "TEST_NAME";
const TEST_PASSWORD = "TEST_PASSWORD";
const TEST_CONTENT = "TEST_CONTENT";
const TEST_CHAN = "TEST_CHAN";

function deleteDB() {
    try {
        fs.unlinkSync("testDB");
    } catch (err) {
        console.log(err);
    }
}

// for test
async function insertMessage(messageRepository: MessageRepository, userEntity: UserEntity, channelEntity: ChannelEntity, content: string): Promise<string> {
    const messageEntity = messageRepository.create(); // const messageEntity = new MessageEntity() と同じ
    messageEntity.id = uuid.v4();
    messageEntity.time = Date.now();
    messageEntity.content = content;
    messageEntity.user = userEntity;
    messageEntity.channel = channelEntity;
    await messageRepository.save(messageEntity);
    const messageId = messageRepository.getId(messageEntity);
    return messageId;
}

describe("getById", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let channelId: number;
    let userId: number;
    let messageId: string;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
            userId = await userRepository.insertAndGetId(TEST_NAME, TEST_PASSWORD);
            const userEntity = await userRepository.getEntityById(userId);
            channelId = await channelRepository.insertAndGetId(TEST_CHAN);
            const channelEntity = await channelRepository.getEntityById(channelId);
            messageId = await insertMessage(messageRepository, userEntity, channelEntity, TEST_CONTENT);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns message", async () => {
        const message = await messageRepository.getById(messageId);
        assert.strictEqual(isMessage(message), true);
        assert.strictEqual(message.id, messageId);
        assert.strictEqual(message.userId, userId);
        assert.strictEqual(message.channelName, TEST_CHAN);
        assert.strictEqual(message.name, TEST_NAME);
        assert.strictEqual(message.content, TEST_CONTENT);
    });
});

describe("getAll", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let channelId: number;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
            channelId = await channelRepository.insertAndGetId(TEST_CHAN);
            const channelEntity = await channelRepository.getEntityById(channelId);

            const userId = await userRepository.insertAndGetId(TEST_NAME, TEST_PASSWORD);
            const userId2 = await userRepository.insertAndGetId(TEST_NAME + "2", TEST_PASSWORD + "2");
            const userEntity: UserEntity = await userRepository.getEntityById(userId);
            const userEntity2: UserEntity = await userRepository.getEntityById(userId2);
            await insertMessage(messageRepository, userEntity, channelEntity, TEST_CONTENT);
            await insertMessage(messageRepository, userEntity2, channelEntity, TEST_CONTENT);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns messages", async () => {
        const messages = await messageRepository.getAll(TEST_CHAN);
        assert.strictEqual(Array.isArray(messages), true);
        messages.forEach((m => {
            assert.strictEqual(isMessage(m), true);
        }));
    });
});

describe("getBeforeSpecifiedTime", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let channelId: number;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
            channelId = await channelRepository.insertAndGetId(TEST_CHAN);
            const userId = await userRepository.insertAndGetId(TEST_NAME, TEST_PASSWORD);
            const userId2 = await userRepository.insertAndGetId(TEST_NAME + "2", TEST_PASSWORD + "2");
            const userEntity: UserEntity = await userRepository.getEntityById(userId);
            const userEntity2: UserEntity = await userRepository.getEntityById(userId2);
            const channelEntity = await channelRepository.getEntityById(channelId);
            for (let i = 0;i < 30;i++) {
                await insertMessage(messageRepository, userEntity, channelEntity, `${TEST_CONTENT}${2 * i}`);
                await insertMessage(messageRepository, userEntity2, channelEntity, `${TEST_CONTENT}${2 * i + 1}`);
            }
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns messages", async () => {
        const idx = 4;
        const n = 5;
        const messages = await messageRepository.getAll(TEST_CHAN); // messages.length = 60 (0 ~ 59)

        const time = messages[idx].time;  // this message is 55th (59-4)
        if (time !== undefined) {
            // expected [54::-5]th message
            const someMessages = await messageRepository.getBeforeSpecifiedTime(TEST_CHAN, time, n);
            assert.strictEqual(Array.isArray(someMessages), true);
            assert.strictEqual(someMessages.length, n);
            someMessages.forEach((m => {
                assert.strictEqual(isMessage(m), true);
            }));
            for (let i = 0;i < n;i++) {
                assert.deepStrictEqual(messages[i + idx + 1], someMessages[i]);
            }
        } else {
            assert.notStrictEqual(time, undefined);
        }
    });
});

describe("getAllAfterSpecifiedTime", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let channelId: number;
    const n = 30;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
            channelId = await channelRepository.insertAndGetId(TEST_CHAN);

            const userId = await userRepository.insertAndGetId(TEST_NAME, TEST_PASSWORD);
            const userId2 = await userRepository.insertAndGetId(TEST_NAME + "2", TEST_PASSWORD + "2");
            const userEntity: UserEntity = await userRepository.getEntityById(userId);
            const userEntity2: UserEntity = await userRepository.getEntityById(userId2);
            const channelEntity = await channelRepository.getEntityById(channelId);
            for (let i = 0;i < n;i++) {
                await insertMessage(messageRepository, userEntity, channelEntity, `${TEST_CONTENT}${2 * i}`);
                await insertMessage(messageRepository, userEntity2, channelEntity, `${TEST_CONTENT}${2 * i + 1}`);
            }
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns messages", async () => {
        const idx = 4;
        const messages = await messageRepository.getAll(TEST_CHAN);
        const time = messages[idx].time;  // this message is 55th
        if (time !== undefined) {
            const someMessages = await messageRepository
                .getAllAfterSpecifiedTime(TEST_CHAN, time);
            assert.strictEqual(Array.isArray(someMessages), true);
            someMessages.forEach((m => {
                assert.strictEqual(isMessage(m), true);
            }));
            assert.deepStrictEqual(someMessages.length, idx);
            for (let i = 0;i < idx;i++) {
                assert.deepStrictEqual(messages[i], someMessages[i]);
            }
        } else {
            assert.notStrictEqual(time, undefined);
        }
    });
});

describe("getByTime", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let channelId: number;
    let message: Message;
    let userId: number;
    let messageId: string;
    let time: number;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
            channelId = await channelRepository.insertAndGetId(TEST_CHAN);

            userId = await userRepository.insertAndGetId(TEST_NAME, TEST_PASSWORD);
            const userEntity: UserEntity = await userRepository.getEntityById(userId);
            const channelEntity = await channelRepository.getEntityById(channelId);
            messageId = await insertMessage(messageRepository, userEntity, channelEntity, TEST_CONTENT);
            message = await messageRepository.getById(messageId);
            time = message.time || 0;

        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns message", async () => {
        const sametimeMessages = await messageRepository.getAllByTime(TEST_CHAN, time);
        sametimeMessages.forEach(sametimeMessage => {
            assert.deepStrictEqual(message, sametimeMessage);
        });
    });
});

describe("insertAndGetId", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let userId: number;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
            await channelRepository.insertAndGetId(TEST_CHAN);

            userId = await userRepository.insertAndGetId(TEST_NAME, TEST_PASSWORD);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns inserted message id", async () => {
        const messageId = await messageRepository.insertAndGetId(TEST_CHAN, userId, TEST_CONTENT);
        const message: Message = await messageRepository.getById(messageId);
        assert.strictEqual(message.id === messageId, true);
    });
});

describe("updateById", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let userId: number;
    let messageId: string;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
            await channelRepository.insertAndGetId(TEST_CHAN);

            userId = await userRepository.insertAndGetId(TEST_NAME, TEST_PASSWORD);
            messageId = await messageRepository.insertAndGetId(TEST_CHAN, userId, TEST_CONTENT);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("update message", async () => {
        const updatedContent = "updated content";
        let original = await messageRepository.getById(messageId);
        await messageRepository.updateById(messageId, updatedContent);
        const updated = await messageRepository.getById(messageId);
        original.content = updatedContent;
        assert.deepStrictEqual(original, updated);
    });
});

describe("deleteById", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let messageId: string;
    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            channelRepository = getConnection(connectionType)
                .getCustomRepository(ChannelRepository);
            await channelRepository.insertAndGetId(TEST_CHAN);

            const userId = await userRepository.insertAndGetId(TEST_NAME, TEST_PASSWORD);
            messageId = await messageRepository.insertAndGetId(TEST_CHAN, userId, TEST_CONTENT);

        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("delete message", async () => {
        await messageRepository.deleteById(messageId);
        let message;
        try {
            message = await messageRepository.getById(messageId);
        } catch (err) {
            assert.strictEqual(message, undefined);
        }
    });
});
