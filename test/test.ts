import { app } from "../src/server";
import * as request from "supertest";
import * as assert from "assert";
import * as fs from "fs";
import { isMessage } from "../src/Message";
import { initializeDB, getMessage, getAllMessages } from "../src/dbHandler";
import * as db from "../src/database";

let cookie: Array<string>;

async function postTestMessage(times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
        await request(app)
            .post("/messages")
            .send({ name: "test_name", message: "test_message" });
    }
}

function deleteDB() {
    try {
        fs.unlinkSync("sqlite3.db");
    } catch (err) {
        console.log(err);
    }
}

describe("GET /", () => {
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

    it("return top page", async () => {
        const response = await request(app)
            .get("/")
            .set("Accept", "text/html")
            .expect("Content-Type", "text/html; charset=utf-8");
        cookie = response.header["set-cookie"];
        console.log(cookie);
    });
});

/*
describe("GET /messages", () => {
    before(async () => {
        try {
            await initializeDB();
            await postTestMessage(3);
        } catch (err) {
            console.log(err);
        }
    });

    after(() => {
        deleteDB();
    });

    it("return messages in response.body", async () => {
        const response = await request(app)
            .get("/messages")
            .set("Accept", "application/json")
            .expect("Content-Type", /application\/json/)
            .expect(200);

        assert.strictEqual(Array.isArray(response.body), true);
        const messages = response.body as Array<any>;
        messages.forEach((m => {
            assert.strictEqual(isMessage(m), true);
        }));
    });
});

describe("POST /messages", () => {
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

    it("returns 200 when parameters are valid", async () => {
        await request(app)
            .post("/messages")
            .send({ name: "test_name", message: "test_message" })
            .expect(200);
    });
});

describe("test regarding session", () => {
    const agent = request.agent(app);
    const testId = 1;
    let cookie: Array<string>;
    before(async () => {
        try {
            await initializeDB();
        } catch (err) {
            console.log(err);
        }
        const response = await agent
            .post("/messages")
            .send({ name: "test_name", message: "test_message" })
            .expect(200);
        cookie = response.header["set-cookie"];
    });
    after(() => {
        deleteDB();
    });

    it("delete message with id = " + testId, async () => {
        const response = await agent
            .delete("/messages/" + testId)
            .set("Cookie", cookie)
            .expect(200);
        const message = await getMessage(testId);
        assert.strictEqual(message, undefined);
    });
});
*/

describe("test for register, login", () => {
    const agent = request.agent(app);
    const name = "hoge";
    const password = "fuga";
    before(async () => {
        try {
            await initializeDB();
            await db.initializeDB();
        } catch (err) {
            console.log(err);
        }
    });
    after(() => {
        deleteDB();
    });
    it(`register/login user with name = ${name}, password = ${password}`, async () => {
        {
            const response = await agent
                .post("/register")
                .send({ name: name, password: password })
                .expect(302);
            try {
                const user = await db.getUserByName(name);
                assert.strictEqual(user.name, name);
                assert.strictEqual(user.password, password);
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
