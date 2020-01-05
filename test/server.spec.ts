import {
    Connection,
    ConnectionOptions,
    createConnection,
    getConnection,
    getCustomRepository
} from "typeorm";
import * as request from "supertest";
import * as assert from "assert";
import * as fs from "fs";
import { UserEntity } from "../src/server/entity/UserEntity";
import { UserRepository } from "../src/server/repository/UserRepository";
import { MessageEntity } from "../src/server/entity/MessageEntity";
import { MessageRepository } from "../src/server/repository/MessageRepository";
import { app } from "../src/server/server";
import { isMessage, isMessageArray } from "../src/common/Message";
import { hash } from "../src/server/handler/hashHandler";

const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";

async function postTestMessage(times: number, cookie: Array<string>): Promise<void> {
    const agent = request.agent(app);

    for (let i = 0; i < times; i++) {
        await agent
            .post("/messages")
            .set("Content-Type", "application/json")
            .send({ name: "test_name", content: "test_message" })
            .set("Cookie", cookie);
    }
}

function deleteDB() {
    try {
        fs.unlinkSync("testDB");
    } catch (err) {
        console.log(err);
    }
}

describe("GET /", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    let cookie: Array<string>;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("return top page", async () => {
        const response = await agent
            .get("/")
            .set("Accept", "text/html")
            .expect("Content-Type", "text/html; charset=utf-8");
        cookie = response.header["set-cookie"];
    });
});

describe("GET /messages", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    let cookie: Array<string>;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            const response = await agent.get("/");
            cookie = response.header["set-cookie"];
            await agent
                .post("/register")
                .send({ name: "test", password: "test"});
            await postTestMessage(3, cookie);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("return messages in response.body", async () => {
        const response = await agent
            .get("/messages")
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
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    let cookie: Array<string>;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            const response = await agent.get("/")
            cookie = response.header["set-cookie"];
            await agent
                .post("/register")
                .send({ name: "test", password: "test"})
            await postTestMessage(1, cookie);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("return messages in response.body", async () => {
        const all = await messageRepository.getAll();
        const response = await agent
            .get(`/messages/id/${all[0].id}`)
            .set("Cookie", cookie)
            .expect("Content-Type", /application\/json/)
            .expect(200);
        assert.deepStrictEqual(all[0], response.body);
    });
});

describe("POST /messages", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    let cookie: Array<string>;

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);

            const response = await agent.get("/");
            cookie = response.header["set-cookie"];

            await agent
                .post("/register")
                .send({ name: "test", password: "test"});

        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("returns 200 when parameters are valid", async () => {
        await agent
            .post("/messages")
            .set("Content-Type", "application/json")
            .send({ name: "test_name", content: "test_message" })
            .set("Cookie", cookie)
            .expect(200);
    });
});

describe("POST /messages", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let cookie: Array<string>;
    const agent = request.agent(app);
    let testId = "not assigned yet";

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);

            const response = await agent.get("/");
            cookie = response.header["set-cookie"];

            await agent
                .post("/register")
                .send({ name: "test", password: "test"});

            await postTestMessage(1, cookie);
            testId = (await messageRepository.getAll())[0].id as string;
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("update message with id = " + testId, async () => {
        const updatedmsg = "updated";
        const response = await agent
            .put("/messages/" + testId)
            .send({ content: updatedmsg })
            .set("Cookie", cookie)
            .expect(200);
        const message = await messageRepository.getById(testId);
        assert.strictEqual(message.content, updatedmsg);
    });
});

describe("DELETE /messages", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    let cookie: Array<string>;
    const agent = request.agent(app);
    let testId = "not assigned yet";

    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);


            const response = await agent.get("/");
            cookie = response.header["set-cookie"];

            await agent
                .post("/register")
                .send({ name: "test", password: "test"});

            await postTestMessage(1, cookie);
            testId = (await messageRepository.getAll())[0].id as string;
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it("delete message with id = " + testId, async () => {
        const response = await agent
            .delete("/messages/" + testId)
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
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    const name = "hoge";
    const password = "fuga";
    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
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

describe("test for updata username and password", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    const name = "hoge";
    const password = "fuga";
    const changedName = "hoge2";
    const changedPass = "fuga2";
    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            userRepository.insertAndGetId(name, password);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it(`change user: name = ${name}, password = ${password} -> ${changedName}, password = ${changedPass}`, async () => {
        {
            const response = await agent
                .put("/setting")
                .send({ name: changedPass, password: changedPass })
                .expect(302);
            try {
                const user = await userRepository.getByName(changedName);
                assert.strictEqual(user.name, changedName);
                assert.strictEqual(user.password, hash(changedPass));
            } catch (err) {
                console.log(err);
            }
        }
        {
            const response = await agent
                .get("/login")
                .send({ name: changedName, password: changedPass })
                .expect(302);
        }
    });
});

describe("test for update user pass", () => {
    let connection: Connection;
    let userRepository: UserRepository;
    let messageRepository: MessageRepository;
    const agent = request.agent(app);
    const name = "hoge";
    const password = "fuga";
    const changedName = "hoge2";
    const changedPass = "fuga2";
    before(async () => {
        try {
            connection = await createConnection(connectionType);
            userRepository = getConnection(connectionType)
                .getCustomRepository(UserRepository);
            messageRepository = getConnection(connectionType)
                .getCustomRepository(MessageRepository);
            userRepository.insertAndGetId(name, password);
        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        await connection.close();
        deleteDB();
    });

    it(`change user: name = ${name}, password = ${password} -> password = ${changedPass}`, async () => {
        {
            const changedPass = "fuga2";
            const response = await agent
                .put("/setting")
                .send({ name: name, password: changedPass })
                .expect(302);
            try {
                const user = await userRepository.getByName(name);
                assert.strictEqual(user.name, name);
                assert.strictEqual(user.password, hash(changedPass));
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
