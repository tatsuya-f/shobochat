import * as request from "supertest";
import * as assert from "assert";
import * as fs from "fs";
import { DatabaseManager } from "../src/server/database/DatabaseManager";
import { UserEntity } from "../src/server/database/entity/UserEntity";
import { UserRepository } from "../src/server/database/repository/UserRepository";
import { MessageEntity } from "../src/server/database/entity/MessageEntity";
import { MessageRepository } from "../src/server/database/repository/MessageRepository";
import { ChannelRepository } from "../src/server/database/repository/ChannelRepository";
import { app } from "../src/server/server";
import { isMessage, isMessageArray } from "../src/common/Message";
import { hash } from "../src/server/handler/hashHandler";
import { NotificationManager } from "../src/server/notification/NotificationManager";

const TEST_PASSWORD = "TEST_PASSWORD";
const TEST_CHAN = "test_chan";

async function postTestMessage(channel: string, times: number, cookie: Array<string>): Promise<void> {
    const agent = request.agent(app);

    for (let i = 0; i < times; i++) {
        await agent
            .post(`/messages/${channel}`)
            .set("Content-Type", "application/json")
            .send({ name: "test_name", content: "test_message" })
            .set("Cookie", cookie);
    }
}

function deleteDB(databasePath: string) {
    try {
        fs.unlinkSync(databasePath);
    } catch (err) {
        console.log(err);
    }
}

describe("GET /", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    let cookie: Array<string>;

    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it("return top page", async () => {
        const response = await agent
            .get("/")
            .set("Accept", "text/html")
            .expect("Content-Type", "text/html; charset=utf-8");
        cookie = response.header["set-cookie"];
    });
});

describe("GET /messages/all/channel", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    const agent = request.agent(app);
    let cookie: Array<string>;

    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);
            channelRepository = databaseManager.getRepository(ChannelRepository);

            await channelRepository.insertAndGetId(TEST_CHAN);
            const response = await agent.get("/");
            cookie = response.header["set-cookie"];
            await agent
                .post("/register")
                .send({ name: "test", password: TEST_PASSWORD});
            await postTestMessage(TEST_CHAN, 3, cookie);

        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it("return messages in response.body", async () => {
        const response = await agent
            .get(`/messages/all/${TEST_CHAN}`)
            .set("Accept", "application/json")
            .set("Cookie", cookie)
            .expect("Content-Type", /application\/json/)
            .expect(200);

        assert.strictEqual(Array.isArray(response.body), true);
        const messages = response.body as Array<any>;
        messages.forEach((m => {
            assert.strictEqual(isMessage(m), true);
        }));
    });
});

describe("GET /messages/id/id", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    const agent = request.agent(app);
    let cookie: Array<string>;

    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);
            channelRepository = databaseManager.getRepository(ChannelRepository);

            await channelRepository.insertAndGetId(TEST_CHAN);
            const response = await agent.get("/");
            cookie = response.header["set-cookie"];
            await agent
                .post("/register")
                .send({ name: "test", password: TEST_PASSWORD});
            await postTestMessage(TEST_CHAN, 1, cookie);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it("return messages in response.body", async () => {
        const all = await messageRepository.getAll(TEST_CHAN);
        const response = await agent
            .get(`/messages/id/${all[0].id}`)
            .set("Cookie", cookie)
            .expect("Content-Type", /application\/json/)
            .expect(200);
        assert.deepStrictEqual(all[0], response.body);
    });
});

describe("POST /messages/channel", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    const agent = request.agent(app);
    let cookie: Array<string>;

    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);
            channelRepository = databaseManager.getRepository(ChannelRepository);

            await channelRepository.insertAndGetId(TEST_CHAN);
            const response = await agent.get("/");
            cookie = response.header["set-cookie"];

            await agent
                .post("/register")
                .send({ name: "test", password: TEST_PASSWORD});

        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it("returns 200 when parameters are valid", async () => {
        await agent
            .post(`/messages/${TEST_CHAN}`)
            .set("Content-Type", "application/json")
            .send({ name: "test_name", content: "test_message" })
            .set("Cookie", cookie)
            .expect(200);
    });
});

describe("PUT /messages/channel/id", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let cookie: Array<string>;
    const agent = request.agent(app);
    let testId = "not assigned yet";

    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);
            channelRepository = databaseManager.getRepository(ChannelRepository);

            await channelRepository.insertAndGetId(TEST_CHAN);
            const response = await agent.get("/");
            cookie = response.header["set-cookie"];

            await agent
                .post("/register")
                .send({ name: "test", password: TEST_PASSWORD});

            await postTestMessage(TEST_CHAN, 1, cookie);
            testId = (await messageRepository.getAll(TEST_CHAN))[0].id as string;
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it("update message with id = " + testId, async () => {
        const updatedmsg = "updated";
        const response = await agent
            .put(`/messages/${TEST_CHAN}/${testId}`)
            .send({ content: updatedmsg })
            .set("Cookie", cookie)
            .expect(200);
        const message = await messageRepository.getById(testId);
        assert.strictEqual(message.content, updatedmsg);
    });
});

describe("DELETE /messages/channel/id", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let channelRepository: ChannelRepository;
    let cookie: Array<string>;
    const agent = request.agent(app);
    let testId = "not assigned yet";

    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);
            channelRepository = databaseManager.getRepository(ChannelRepository);

            await channelRepository.insertAndGetId(TEST_CHAN);

            const response = await agent.get("/");
            cookie = response.header["set-cookie"];

            await agent
                .post("/register")
                .send({ name: "test", password: TEST_PASSWORD});

            await postTestMessage(TEST_CHAN, 1, cookie);
            testId = (await messageRepository.getAll(TEST_CHAN))[0].id as string;
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it("delete message with id = " + testId, async () => {
        const response = await agent
            .delete(`/messages/${TEST_CHAN}/${testId}`)
            .set("Cookie", cookie)
            .expect(200);

        let message;
        try {
            message = await messageRepository.getById(testId);
        } catch (err) {
            assert.strictEqual(message, undefined);
        }
    });
});

describe("test for register and login", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    const name = "hoge";
    const password = TEST_PASSWORD;
    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);

        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it(`register and login user with name = ${name}, password = ${password}`, async () => {
        {
            const response = await agent
                .post("/register")
                .send({ name: name, password: password })
                .expect(302);
            try {
                const user = await userRepository.getByName(name);
                assert.strictEqual(user.name, name);
                assert.strictEqual(user.password, hash(password));
            } catch (err) {
                console.log(err);
            }
        }
        {
            const response = await agent
                .get("/login")
                .send({ name: name, password: password })
                .expect(302);
        }
    });
});

describe("test for updata username", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    const name = "hoge";
    const password = TEST_PASSWORD;
    const changedName = "hoge2";
    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);

            await agent
                .post("/register")
                .send({ name, password });
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it(`change user name = ${name} -> ${changedName}`, async () => {
        {
            const response = await agent
                .put("/setting/username")
                .send({ name: changedName })
                .expect(200);
            try {
                const user = await userRepository.getByName(changedName);
                assert.strictEqual(user.name, changedName);
            } catch (err) {
                console.log(err);
            }
        }
        {
            const response = await agent
                .get("/login")
                .send({ name: changedName, password: password })
                .expect(302);
        }
    });
});

describe("test for update userpass", () => {
    let databaseManager: DatabaseManager;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    const name = "hoge";
    const password = TEST_PASSWORD;
    const changedPass = "changed" + TEST_PASSWORD;
    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            userRepository = databaseManager.getRepository(UserRepository);
            messageRepository = databaseManager.getRepository(MessageRepository);

            await agent
                .post("/register")
                .send({ name, password });
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it(`change user password ${password} -> ${changedPass}`, async () => {
        {
            const response = await agent
                .put("/setting/userpass")
                .send({ password: changedPass })
                .expect(200);
            try {
                const user = await userRepository.getByName(name);
                assert.strictEqual(user.password, hash(changedPass));
            } catch (err) {
                console.log(err);
            }
        }
        {
            const response = await agent
                .get("/login")
                .send({ name: name, password: changedPass })
                .expect(302);
        }
    });
});

describe("test for add channel", () => {
    let databaseManager: DatabaseManager;
    let channelRepository: ChannelRepository;
    const agent = request.agent(app);
    const name = "hoge";
    const password = TEST_PASSWORD;
    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            channelRepository = databaseManager.getRepository(ChannelRepository);
            await agent
                .post("/register")
                .send({ name, password });
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it(`add channel ${TEST_CHAN}`, async () => {
        const response = await agent
            .post("/channels")
            .send({ channel: TEST_CHAN })
            .expect(200);
        try {
            assert.strictEqual(await channelRepository.hasName(TEST_CHAN), true);
        } catch (err) {
            console.log(err);
        }
    });
});

describe("test for delete channel", () => {
    let databaseManager: DatabaseManager;
    let channelRepository: ChannelRepository;
    const agent = request.agent(app);
    const name = "hoge";
    const password = TEST_PASSWORD;
    before(async () => {
        try {
            await NotificationManager.initialize();
            await DatabaseManager.initialize();
            databaseManager = DatabaseManager.getInstance();
            channelRepository = databaseManager.getRepository(ChannelRepository);
            await agent
                .post("/register")
                .send({ name, password });
            const response = await agent
                .post("/channels")
                .send({ channel: TEST_CHAN })
                .expect(200);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        deleteDB(databaseManager.getDatabasePath());
        await databaseManager.closeConnection();
    });

    it(`delete channel ${TEST_CHAN}`, async () => {
        try {
            const response = await agent
                .delete("/channels")
                .send({ channel: TEST_CHAN })
                .expect(200);
            assert.strictEqual(await channelRepository.hasName(TEST_CHAN), false);
        } catch (err) {
            console.log(err);
        }
    });
});
