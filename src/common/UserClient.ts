import { UserInfo } from "./UserInfo";

export class UserClient implements UserInfo {
    name: string;
    password: string;
    constructor(name: string, password: string) {
        this.name = name;
        this.password = password;
    }
    async post(url: string): Promise<number> {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(this),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async put(url: string): Promise<number> {
        const res = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(this),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
}
