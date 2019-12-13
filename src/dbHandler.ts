import { Message } from "./Message";
import * as sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();

export function initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("sqlite3.db");
        const sql = "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, userId CHAR(35) NOT NULL, time INTEGER NOT NULL, name TEXT NOT NULL, message TEXT NOT NULL)";
        db.run(sql, (err) => {
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function insertMessage(msg: Message): Promise<void> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("sqlite3.db");
        const userId = msg.userId;
        const time = Date.now();
        const name = msg.name;
        const message = msg.message;

        // プレースホルダを利用すると，非NULLのエラーを出してくれるので，こちらでは特にチェックをしない
        const sql = "INSERT INTO messages (userId, time, name, message) VALUES(?, ?, ?, ?)";

        db.run(sql, [userId, time, name, message], (err) => {
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function getMessage(id: number): Promise<Message> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("sqlite3.db");
        const sql = "SELECT id, userId, time, name, message FROM messages WHERE id = ?";

        db.get(sql, [id], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function getAllMessages(): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("sqlite3.db");
        const sql = "SELECT id, userId, time, name, message FROM messages ORDER BY time DESC";
        db.all(sql, (err, rows) => {
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function deleteMessage(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("sqlite3.db");
        const sql = "DELETE FROM messages where id = ?";

        db.run(sql, [id], (err) => {
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
