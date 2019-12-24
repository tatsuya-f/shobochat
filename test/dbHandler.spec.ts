import * as request from "supertest";
import * as assert from "assert";
import * as fs from "fs";
import {
    Message,
    isMessage } from "../src/Message";
import { User, isUser } from "../src/User";
import {
    initializeDB,
    getUserByName,
    hasUserName,
    insertUser,
    getMessage,
    getBeforeMessages,
    getAllMessages,
    insertMessage,
    deleteMessage } from "../src/dbHandler";

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
        assert.strictEqual(isUser(testUser), true);
        assert.strictEqual(testUser.name, testName);
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
    let messageId: string;
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
        assert.strictEqual(isMessage(message), true);
        assert.strictEqual(message.id, messageId);
        assert.strictEqual(message.userId, userId);
        assert.strictEqual(message.name, testName);
        assert.strictEqual(message.message, testMessage);
    });
});

describe("getAllMessages", () => {
    before(async () => {
        try {
            await initializeDB();
            const userId = await insertUser(testName, testPassword);
            const userId2 = await insertUser(testName + "2", testPassword + "2");
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
        assert.strictEqual(Array.isArray(messages), true);
        messages.forEach((m => {
            assert.strictEqual(isMessage(m), true);
        }));
    });
});

describe("getBeforeMessages", () => {
    before(async () => {
        try {
            await initializeDB();
            const userId = await insertUser(testName, testPassword);
            const userId2 = await insertUser(testName + "2", testPassword + "2");
            for (let i = 0;i < 30;i++) {
                await insertMessage(userId, `${testMessage}${2 * i}`);
                await insertMessage(userId2, `${testMessage}${2 * i + 1}`);
            }
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("returns messages", async () => {
        const idx = 4;
        const n = 5;
        const messages = await getAllMessages();
        const time = messages[idx].time;  // this message is 55th
        if (time !== undefined) {
            // expected [54::-5]th message
            const someMessages = await getBeforeMessages(time, n);
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
        assert.strictEqual(message.id === messageId, true);
    });
});

describe("deleteMessage", () => {
    let userId: number;
    let messageId: string;
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
