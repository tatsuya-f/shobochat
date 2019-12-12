import { app } from "../src/server";
import * as request from "supertest";
import * as assert from "assert";
import { Message, isMessage } from '../src/Message';

describe("GET /", () => {
    it("return top page", async () => {
        const response = await request(app)
            .get("/")
            .set("Accept", "text/html")
            .expect("Content-Type", "text/html; charset=utf-8")
    });
});

describe("POST /messages", () => {
    it("returns 200 when parameters are valid", async () => {
        await request(app)
            .post("/messages")
            .send({userId: 999, name: "test_name", message: "test_message"})
            .expect(200);
    });
});

describe("GET /messages", () => {
    it("return messages in response.body", async () => {
        const response = await request(app)
            .get("/messages")
            .set("Accept", "application/json")
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);

        assert.equal(Array.isArray(response.body), true);
        const messages = response.body as Array<any>;
        messages.forEach((m => {
            assert.equal(isMessage(m), true);
        }));
    });
});
