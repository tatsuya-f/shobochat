import * as request from "supertest";
import * as assert from "assert";
import * as fs from "fs";
import { Message,
         isMessage } from "../src/Message";
import { User, isUser } from "../src/User";
import { initializeDB, 
         getUserByName, 
         hasUserName,
         insertUser, 
         getMessage,
         getAllMessages,
         insertMessage,
         deleteMessage} from "../src/dbHandler";

const testName = "testName";
const testPassword = "testPassword";
const testMessage = "testMessage";

function deleteDB() {
    try {
        fs.unlinkSync("sqlite3.db");
    } catch (err) {
        console.log(err);
    }
}

describe("getUserByName", () => {
    before(async () => {
        try {
            await initializeDB();
            await insertUser(testName, testPassword);
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("returns User object", async () => {
        const testUser = await getUserByName(testName);
        assert.equal(isUser(testUser), true);
        assert.equal(testUser.name === testName, true);
    });
});

describe("hasUserName", () => {
    before(async () => {
        try {
            await initializeDB();
            await insertUser(testName, testPassword);
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("return true when user exists", async () => {
        assert.equal(await hasUserName(testName), true);
    });
    it("returns false when user doesn't exist", async () => {
        assert.equal(await hasUserName("not exsit"), false);
    });
});

describe("insertUser", () => {
    before(async () => {
        try {
            await initializeDB();
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("returns id of inserted User", async () => {
        const id = await insertUser(testName, testPassword);
        const testUser = await getUserByName(testName);
        assert.equal(id === testUser.id, true);
    });
});

describe("getMessage", () => {
    let userId: number;
    let messageId: number;
    before(async () => {
        try {
            await initializeDB();
            userId = await insertUser(testName, testPassword);
            messageId = await insertMessage(userId, testMessage);
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("returns message", async () => {
        const message = await getMessage(messageId);
        assert.equal(isMessage(message), true);
        assert.equal(message.id === messageId, true);
        assert.equal(message.userId=== userId, true);
        assert.equal(message.name === testName, true);
        assert.equal(message.message === testMessage, true);
    });
});

describe("getAllMessages", () => {
    let userId: number;
    let userId2: number;
    before(async () => {
        try {
            await initializeDB();
            userId = await insertUser(testName, testPassword);
            userId2 = await insertUser(testName + "2", testPassword + "2");
            await insertMessage(userId, testMessage);
            await insertMessage(userId2, testMessage);
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("returns messages", async () => {
        const messages = await getAllMessages();
        assert.equal(Array.isArray(messages), true);
        messages.forEach((m => {
            assert.equal(isMessage(m), true);
        }));
    });
});

describe("insertMessage", () => {
    let userId: number;
    before(async () => {
        try {
            await initializeDB();
            userId = await insertUser(testName, testPassword);
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("returns inserted message id", async () => {
        const messageId = await insertMessage(userId, testMessage);
        const message: Message = await getMessage(messageId);
        assert.equal(message.id === messageId, true);
    });
});

describe("deleteMessage", () => {
    let userId: number;
    let messageId: number;
    before(async () => {
        try {
            await initializeDB();
            userId = await insertUser(testName, testPassword);
            messageId = await insertMessage(userId, testMessage);
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("delete message", async () => {
        await deleteMessage(messageId);
        const message = await getMessage(messageId);
        assert.equal(message === undefined, true);
    });
});
