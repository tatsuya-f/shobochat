
import { Message } from "../../common/Message";
export class HTTPHandler {
    url: string = "/messages"
    async get(messageId: string): Promise<Message> {
        const res = await fetch(`${this.url}/id/${messageId}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`Failed to get Message whose id is ${messageId}`);
        }
    }
    async getNewer(time: number): Promise<Array<Message>> {
        const res = await fetch(`${this.url}/time-after/${time}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`Failed to get Messages newer than ${time}`);
        }
    }
    async getOlder(time: number, num: number): Promise<Array<Message>> {
        const res = await fetch(`${this.url}/time-before/${time}/${num}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`Failed to get Messages older than ${time}`);
        }
    }
    async post(content: string): Promise<number> {
        const res = await fetch(this.url, {
            method: "POST",
            body: JSON.stringify({ content: content }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async delete(messageId: string): Promise<number> {
        const res = await fetch(`${this.url}/${messageId}`, {
            method: "DELETE",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async put(messageId: string, content: string): Promise<number> {
        const res = await fetch(`${this.url}/${messageId}`, {
            method: "PUT",
            body: JSON.stringify({
                content: content
            }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
}

export const httpHandler = new HTTPHandler();
