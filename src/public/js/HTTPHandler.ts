import { Message } from "../../common/Message";

export class HTTPHandler {
    private url: string = "/messages"
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
    async getInit(channel: string): Promise<Array<Message>> {
        const res = await fetch(`${this.url}/init/${channel}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`Failed to initialize channel: ${channel}`);
        }
    }
    async getNewer(channel: string, time: number): Promise<Array<Message>> {
        const res = await fetch(`${this.url}/time-after/${channel}/${time}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`${channel}: Failed to get Messages newer than ${time}`);
        }
    }
    async getOlder(channel: string, time: number, num: number): Promise<Array<Message>> {
        const res = await fetch(`${this.url}/time-before/${channel}/${time}/${num}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`${channel}: Failed to get ${num} Messages older than ${time}`);
        }
    }
    async post(channel: string, content: string): Promise<number> {
        const res = await fetch(`${this.url}/${channel}`, {
            method: "POST",
            body: JSON.stringify({ content: content }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async delete(channel: string, messageId: string): Promise<number> {
        const res = await fetch(`${this.url}/${channel}/${messageId}`, {
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

