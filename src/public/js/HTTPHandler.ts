import { Message } from "../../common/Message";

export class MessagesHTTPHandler {
    async get(messageId: string): Promise<Message> {
        const res = await fetch(`/messages/id/${messageId}`, {
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
        const res = await fetch(`/messages/init/${channel}`, {
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
        const res = await fetch(`/messages/time-after/${channel}/${time}`, {
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
        const res = await fetch(`/messages/time-before/${channel}/${time}/${num}`, {
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
        const res = await fetch(`/messages/${channel}`, {
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
        const res = await fetch(`/messages/${channel}/${messageId}`, {
            method: "DELETE",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async put(channel: string, messageId: string, content: string): Promise<number> {
        const res = await fetch(`/messages/${channel}/${messageId}`, {
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


export class SettingHTTPHandler {
    async putUsername(username: string): Promise<number> {
        const res = await fetch("/setting/username/", {
            method: "PUT",
            body: JSON.stringify({
                name: username
            }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async putUserpass(userpass: string): Promise<number> {
        const res = await fetch("/setting/userpass", {
            method: "PUT",
            body: JSON.stringify({
                password: userpass
            }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async postChannel(newChannel: string): Promise<number> {
        const res = await fetch(`/channels/${newChannel}`, {
            method: "POST",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async deleteChannel(channel: string): Promise<number> {
        const res = await fetch(`/channels/${channel}`, {
            method: "DELETE",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
}
