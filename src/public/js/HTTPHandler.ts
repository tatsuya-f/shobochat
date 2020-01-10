import { Message } from "../../common/Message";
import { defaultChannel } from "../../common/Channel";

export class HTTPHandler {
    private url: string = "/messages"
    private _channel = defaultChannel;
    set channel(channel: string) {
        if (this._channel === channel) { return; }
        this._channel = channel;
    }
    get channel(): string {
        return this._channel;
    }
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
        const res = await fetch(`${this.url}/time-after/${this._channel}/${time}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`${this._channel}: Failed to get Messages newer than ${time}`);
        }
    }
    async getOlder(time: number, num: number): Promise<Array<Message>> {
        const res = await fetch(`${this.url}/time-before/${this._channel}/${time}/${num}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`${this._channel}: Failed to get ${num} Messages older than ${time}`);
        }
    }
    async post(content: string): Promise<number> {
        const res = await fetch(`${this.url}/${this._channel}`, {
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

