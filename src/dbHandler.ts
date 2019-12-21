import { User } from "./User";
import { Message } from "./Message";
import * as sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();
const databaseName = "sqlite3.db";

export async function initializeDB(): Promise<void> {
    const userInfoTable = `userInfo(
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         name TEXT UNIQUE NOT NULL,
                         password TEST NOT NULL
                         )`;

    const messagesTable = `messages (
                         id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL,
                         time INTEGER NOT NULL, message TEST NOT NULL,
                         FOREIGN KEY(userId) REFERENCES userInfo(id)
                         )`;

    await createTable(userInfoTable);
    await createTable(messagesTable);
}

function createTable(tableInfo: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(databaseName);
        const sql = "CREATE TABLE IF NOT EXISTS" + " " + tableInfo;
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

export function getUserByName(name: string): Promise<User> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(databaseName);
        const sql = "SELECT * FROM userInfo WHERE name = ?";

        db.get(sql, [name], (err, row) => {
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

export function hasUserName(name: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(databaseName);
        const sql = "SELECT * FROM userInfo WHERE name = ?";
        db.get(sql, [name], (err, row) => {
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve(!!row); // booleanに変換
        });
    });
}

// insert された user の user id をプロミスに入れて返します
export function insertUser(name: string, password: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(databaseName);
        const sql = "INSERT INTO userInfo (name, password) VALUES(?, ?)";
        db.serialize(() => {
            db.run(sql, [name, password], (err) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }
            });
            db.get("SELECT last_insert_rowid() as last_insert_rowid", (err, row) => { // カラムをaliasing
                db.close();
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row["last_insert_rowid"]);
            });
        });
    });
}

export function getMessage(messageId: number): Promise<Message> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(databaseName);
        const sql = `SELECT messages.id, userId, time, name, message
                     FROM messages INNER JOIN userInfo ON messages.userId = userInfo.id
                     WHERE messages.id = ?`;

        db.get(sql, [messageId], (err, row) => { // クエリを実行して1番目の結果だけにcallbackを実行する
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

export function getAllMessages(): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(databaseName);
        const sql = `SELECT messages.id, userId, time, name, message
                    FROM messages INNER JOIN userInfo ON messages.userId = userInfo.id
                    ORDER BY time DESC`;
        db.all(sql, (err, rows) => { // クエリを実行して全ての結果に対して1度だけcallbackを実行する
            db.close();
            if (err) {
                reject(err);
                return;
            }
            console.log("in getAllMessages");
            console.log(rows);
            resolve(rows);
        });
    });
}

// insert された message の message id をプロミスに入れて返します
export function insertMessage(userId: number, message: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(databaseName);
        const time = Date.now();

        /*
         * プレースホルダを利用すると，非NULLのエラーがでる
         * (文字列連結だと文字列"undefined"が格納されるので注意)
         * 
         * messages.userIdはuserInfo.idを参照しているので，
         * messages.userIdにはuserInfo.idに無いものは入れられない
         */
        const sql = "INSERT INTO messages (userId, time, message) VALUES(?, ?, ?)";

        db.serialize(() => {
            db.run(sql, [userId, time, message], (err) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }
                console.log("insert success");
            });

            db.get("SELECT last_insert_rowid() as last_insert_rowid", (err, row) => { // カラムをaliasing
                db.close();
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row["last_insert_rowid"]); // return message id
            });
        });
    });
}

export function deleteMessage(messageId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(databaseName);
        const sql = "DELETE FROM messages where id = ?";

        db.run(sql, [messageId], (err) => {
            db.close();
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
