import { app } from "../src/server";
import * as request from "supertest";
import * as assert from "assert";
import * as fs from "fs";
import { Message, isMessage } from "../src/Message";
import { initializeDB, getMessage } from "../src/dbHandler";

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
    });
});

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

        assert.equal(Array.isArray(response.body), true);
        const messages = response.body as Array<any>;
        messages.forEach((m => {
            assert.equal(isMessage(m), true);
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

const test_id = 1;
describe("DELETE /messages/" + test_id, () => {
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

    it("delete message with id = " + test_id, async () => {
        const response = await request(app)
            .delete("/messages/" + test_id)
            .expect(200);

        const message = await getMessage(test_id);
        assert.equal(typeof message === "undefined", true);
    });
});
