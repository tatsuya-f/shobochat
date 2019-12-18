import * as express from "express";
import * as session from "express-session";
import * as expressWs from "express-ws";
import {
    initializeDB,
    getMessage,
    getAllMessages,
    insertMessage,
    deleteMessage,
} from "./dbHandler";
import * as db from "./database";
import * as uuid from "uuid";
import * as WebSocket from "ws";
import { Request, Response, NextFunction } from "express";
import * as path from "path";
// import * as chat from "./route/chat";
// import * as login from "./route/login";
// import * as register from "./route/register";

const exWs = expressWs(express());
export const app = exWs.app;

async function sendAllMessage() {
    // 接続を管理するServer．Clientと接続されるとこいつが記憶してる（実際はexWsだが）
    const wss: WebSocket.Server = exWs.getWss();
    const messages = await getAllMessages();

    // 接続されている各Clientにsendする
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(messages));
    });
}

app.set("port", 8000);
app.use(express.static("public"));
app.use(express.json());
app.use(session({
    secret: "shoboshobo",
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 365 // 1 year
    }
}));

app.get("/messages", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await getAllMessages();
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

app.post("/messages", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contentType = req.header("Content-Type");

        /*
         * post はMIME Type を偽装してシンプルなリクエストに
         * する可能性があるので，以下の対策をする
         * その場合，Access-Control-Allow-Headers を
         * 緩和してはいけない
         *
         * delete はシンプルなリクエストになりえないので
         * Access-Control-Allow-Methods を
         * 緩和しない限りは特にチェックは必要ない
         *
         * 時間があったら，token を生成する方法にする
         */
        // MIME Type を偽装してシンプルなリクエストにしてきた場合の対処
        if (contentType !== "application/json") {
            console.log("** CSRF detected **");
            res.status(500).end();
            return;
        }

        const sess = req.session;
        if (sess === undefined) {
            res.status(500).end();
            return;
        }
        if (sess.userId === undefined) {
            sess.userId = uuid();
        }
        const insertableMessage = {
            userId: sess.userId,
            name: req.body.name,
            message: req.body.message
        };
        await insertMessage(insertableMessage);
        await sendAllMessage();
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

app.delete("/messages/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sess = req.session;
        if (sess === undefined) {
            res.status(500).end();
            return;
        }
        const messageId = parseInt(req.params.id);
        const message = await getMessage(messageId);
        if (message.userId === sess.userId) { // accept
            await deleteMessage(messageId);
            await sendAllMessage();
            res.status(200).end();
        }
        else { // reject
            res.status(500).end();
        }
    } catch (err) {
        next(err);
    }
});

app.ws("/messages", (ws, req) => {
    // 接続完了後Client側でsendするとServerのmessage eventが発火
    ws.on("message", async (recvJsonData) => {
        try {
            if (typeof recvJsonData !== "string") { return; }
            const recvData = JSON.parse(recvJsonData);
            const operation = recvData["operation"];
            if (operation === "sessionStart") {
                const sess = req.session;
                if (sess === undefined) { return; }
                if (sess.userId === undefined) {
                    sess.userId = uuid();
                }
                await sendAllMessage();
            }
        } catch (err) {
            console.log(err);
        }
    });
    ws.on("close", () => {
    });
});

app.get("/chat", (req, res) => {
    res.sendFile("chat.html", {
        root: path.join(__dirname, "public")
    }, (err) => {
        console.log(err);
    });
});

app.get("/login.html", (req, res) => {
    res.sendFile("login.html", {
        root: path.join(__dirname, "public")
    }, (err) => {
        console.log(err);
    });
});

app.get("/login", async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    try {
        const user = await db.getUserByName(name);
        if (user.password === password) {
            const sess = req.session;
            if (sess === undefined) {
                res.status(500).end();
            } else {
                sess.userId = user.id;
                sess.name = user.name;
                res.redirect("/chat");
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

app.get("/register.html", (req, res) => {
    res.sendFile("register.html", {
        root: path.join(__dirname, "public")
    }, (err) => {
        console.log(err);
    });
});

app.post("/register", async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    if (await db.hasUserName(name)) { // reject
        res.status(500).end();
    } else {  // accept; register
        try {
            await db.insertUser({
                name: name,
                password: password
            });
            const sess = req.session;
            if (sess === undefined) { return; }
            sess.userId = uuid();
            sess.name = name;
            res.redirect("/chat");
        } catch (err) {
            console.log(err);
            res.status(500).end();
        }
    }

});

(async function startServer() {
    try {
        await initializeDB();

        if (__filename.includes("dist")) {
            const port = app.get("port");
            app.listen(port, () =>
                console.log("Server listening on port " + port)
            );
        }
    } catch (err) {
        console.log(err);
    }
})();
