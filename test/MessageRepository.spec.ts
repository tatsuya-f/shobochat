/*
import { 
    Connection, 
    ConnectionOptions, 
    createConnection, 
    getConnection, 
    getCustomRepository 
} from "typeorm";
import { UserRepository } from "../src/repository/UserRepository";
import { MessageEntity } from "../src/entities/MessageEntity";
import { MessageRepository } from "../src/repository/MessageRepository";
import * as assert from "assert";
import * as fs from "fs";
import { Message, isMessage } from "../src/Message";

const testName = "testName";
const testPassword = "testPassword";
const testMessage = "testMessage";

function deleteDB() {
    try {
        fs.unlinkSync("MessageRepositoryTestDB");
    } catch (err) {
        console.log(err);
    }
}

describe("getMessage", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let userId: number;
    let messageId: string;
    before(async () => {
        try {
            connection = await createConnection("MessageRepositoryTestConnection");
            messageRepository = getConnection("MessageRepositoryTestConnection")
              .getCustomRepository(MessageRepository); 

            userId = await insertUser(testName, testPassword);
            messageId = await insertMessage(userId, testMessage);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns message", async () => {
        const message = await getMessage(messageId);
        assert.strictEqual(isMessage(message), true);
        assert.strictEqual(message.id, messageId);
        assert.strictEqual(message.userId, userId);
        assert.strictEqual(message.name, testName);
        assert.strictEqual(message.content, testMessage);
    });
});
*/
