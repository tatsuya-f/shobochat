import { 
    Connection, 
    ConnectionOptions, 
    createConnection, 
    getConnection, 
    getCustomRepository 
} from "typeorm";
import * as uuid from "uuid";
import { UserEntity } from "../src/entities/UserEntity";
import { UserRepository } from "../src/repository/UserRepository";
import { MessageEntity } from "../src/entities/MessageEntity";
import { MessageRepository } from "../src/repository/MessageRepository";
import * as assert from "assert";
import * as fs from "fs";
import { Message, isMessage } from "../src/Message";

const TEST_NAME = "TEST_NAME";
const TEST_PASSWORD = "TEST_PASSWORD";
const TEST_MESSAGE = "TEST_MESSAGE";

function deleteDB() {
    try {
        fs.unlinkSync("testDB");
    } catch (err) {
        console.log(err);
    }
}

async function getUserEntity(userRepository: UserRepository, userId: number): Promise<UserEntity> {
    const userEntity = await userRepository.findOne({ where: { id: userId } });

    if (userEntity !== undefined) {
        return userEntity;
    } else {
        throw new Error("not found");
    }
}

async function insertTestUser(userRepository: UserRepository): Promise<number> {
    const userEntity = userRepository.create(); // const userEntity = new UserEntity() と同じ
    userEntity.name = TEST_NAME;
    userEntity.password = TEST_PASSWORD;
    await userRepository.save(userEntity);
    const userId = userRepository.getId(userEntity);
    return userId;
}

async function insertTestMessage(messageRepository: MessageRepository, userEntity: UserEntity): Promise<string> {
    const messageEntity = messageRepository.create(); // const messageEntity = new MessageEntity() と同じ
    messageEntity.id = uuid.v4();
    messageEntity.time = Date.now();
    messageEntity.content = TEST_MESSAGE;
    messageEntity.user = userEntity;
    await messageRepository.save(messageEntity);
    const messageId = messageRepository.getId(messageEntity);
    return messageId;
}

describe("getById", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let userId: number;
    let messageId: string;

    before(async () => {
        try {
            connection = await createConnection("testConnection");
            userRepository = getConnection("testConnection")
                .getCustomRepository(UserRepository); 
            messageRepository = getConnection("testConnection")
              .getCustomRepository(MessageRepository); 

            userId = await insertTestUser(userRepository);
            const userEntity: UserEntity = await getUserEntity(userRepository, userId);
            messageId = await insertTestMessage(messageRepository, userEntity);
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
        assert.strictEqual(message.name, TEST_NAME);
        assert.strictEqual(message.content, TEST_MESSAGE);
    });
});

/*
describe("getAll", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;

    before(async () => {
        try {
            connection = await createConnection("testConnection");
            userRepository = getConnection("testConnection")
                .getCustomRepository(UserRepository); 
            messageRepository = getConnection("testConnection")
              .getCustomRepository(MessageRepository); 

            const userId = await insertUser(TEST_NAME, TEST_PASSWORD);
            const userId2 = await insertUser(TEST_NAME + "2", TEST_PASSWORD + "2");
            await insertMessage(userId, TEST_MESSAGE);
            await insertMessage(userId2, TEST_MESSAGE);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns messages", async () => {
        const messages = await getAllMessages();
        assert.strictEqual(Array.isArray(messages), true);
        messages.forEach((m => {
            assert.strictEqual(isMessage(m), true);
        }));
    });
});
*/
