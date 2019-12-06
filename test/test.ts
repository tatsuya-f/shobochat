const request = require('supertest');
const assert = require('power-assert');
const app = require('../src/server.ts');

describe("GET /", () => {
    it('return top page', async () => {
        const response = await request(app)
            .get('/')
            .set('Accept', 'text/html')
            .expect('Content-Type', 'text/html; charset=utf-8')
    });
});

describe("POST /messages", () => {
    it('returns 200 when parameters are valid', async () => {
        await request(app)
            .post('/messages')
            .send({name: 'test_name', message: 'test_message'})
            .expect(200);
    });
});

describe("GET /messages", () => {
    it('return messages in response.body', async () => {
        const response = await request(app)
            .get('/messages')
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(200);

        const messages = response.body;
        assert.equal(Array.isArray(messages), true);
        messages.forEach((m => {
            assert.equal(typeof m.time === 'number', true);
            assert.equal(typeof m.name === 'string', true);
            assert.equal(typeof m.message === 'string', true);
        }));
    });
});
