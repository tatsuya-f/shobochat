import { app } from "../src/server";
import * as request from "supertest";
import * as assert from "assert";
import * as fs from "fs";
import { Message, isMessage } from '../src/Message';
import { getMessage } from "../src/dbHandler";

describe("GET /", () => {
    it("return top page", async () => {
        const response = await request(app)
            .get("/")
            .set("Accept", "text/html")
            .expect("Content-Type", "text/html; charset=utf-8")
    });
});

describe("test /messages", async () => {

    await describe("POST /messages", () => {

        it('returns 200 when parameters are valid', async () => {
            await request(app)
                .post('/messages')
                .send({userId: 1, name: 'test_name', message: 'test_message'})
                .expect(200);
        });
    });

    await describe("GET /messages", () => {

        it('return messages in response.body', async () => {
            const response = await request(app)
                .get('/messages')
                .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const messageList = response.body;

            assert.equal(Array.isArray(response.body), true);
            const messages = response.body as Array<any>;
            messages.forEach((m => {
                assert.equal(isMessage(m), true);
            }));
        });
    });

    const test_id = 1;
    await describe("DELETE /messages/" + test_id, () => {

        it("delete message with id = " + test_id, async () => {
            const response = await request(app)
                .delete("/messages/" + test_id)
                .expect(200);

            const message = await getMessage(test_id);
            assert.equal(typeof message === "undefined", true);
        });
    });

    after(() => {
        try {
            fs.unlinkSync('sqlite3.db');
        } catch (error) {
            throw error;
        }
    });
});
