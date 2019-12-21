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
// import * as uuid from "uuid";
import * as WebSocket from "ws";
import { Request, Response, NextFunction } from "express";
// import * as chat from "./route/chat";
// import * as login from "./route/login";
// import * as register from "./route/register";

const exWs = expressWs(express());
export const app = exWs.app;

async function sendAllMessage() {
    // 接続を管理するServer．Clientと接続されるとこいつが記憶してる（実際はexWsだが）
    const wss: WebSocket.Server = exWs.getWss();
    const messages = await db.getAllMessages();
    console.log(messages);

    // 接続されている各Clientにsendする
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(messages));
    });
}

function redirectChatWhenLoggedIn(req: Request, res: Response, next: NextFunction) {
    const sess = req.session;
    if (sess !== undefined && sess.isLogined) {
        res.redirect("/chat");
    } else {
        next();
    }
}

function checkLogin(req: Request, res: Response, next: NextFunction) {
    const sess = req.session;
    if (sess === undefined || !sess.isLogined) {
        res.redirect("/"); // ログインしていない場合は top へ
    } else {
        next(); // ログインしているときは，次の middleware へ
    }
}

app.set("port", 8000);
app.use(express.json());
app.use(session({
    secret: "shoboshobo",
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 365 // 1 year
    }
})); // 各エンドポイントにアクセスされる際に，付与していない場合は session 用の Cookie をブラウザに付与

app.get("/messages", checkLogin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await getAllMessages();
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

app.post("/messages", checkLogin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sess = req.session;
        if (sess === undefined) {
            console.log("session not working");
            res.status(500).end();
            return;
        }

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
        const contentType = req.header("Content-Type");
        if (contentType !== "application/json") {
            console.log("** CSRF detected **");
            res.status(500).end();
            return;
        }

        console.log(sess.userId);
        console.log(req.body.message);
        await insertMessage(sess.userId, req.body.message);
        console.log("inserted");
        await sendAllMessage();
        console.log("sendMessage (WebSocket)");
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

app.delete("/messages/:id", checkLogin, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

app.get("/chat", checkLogin, (req: Request, res: Response, next: NextFunction) => {
    res.sendFile("chat.html", {
        root: "public",
    }, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Send");
        }
    });
});

app.ws("/messages", (ws, req) => {
    // 接続完了後Client側でsendするとServerのmessage eventが発火
    ws.on("message", async (recvJsonData) => {
        console.log("WebSocket connected");
        try {
            if (typeof recvJsonData !== "string") { return; }
            const recvData = JSON.parse(recvJsonData);
            const operation = recvData["operation"];
            if (operation === "sessionStart") {
                const sess = req.session;
                if (sess === undefined) { return; }
                // TODO: check session and already logined, if not logined yet, redirect /login
                await sendAllMessage();
            }
        } catch (err) {
            console.log(err);
        }
    });
    ws.on("close", () => {
    });
});

app.get("/", redirectChatWhenLoggedIn, (req: Request, res: Response, next: NextFunction) => {
    next();
});

app.use(express.static("public")); // GET / された後に静的ファイルを配信

app.get("/login", redirectChatWhenLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    res.sendFile("login.html", {
        root: "public",
    }, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Send");
        }
    });
});

app.post("/login", async (req: Request, res: Response) => {
    const sess = req.session;
    if (sess === undefined) {
        console.log("session not working");
        res.status(500).end();
        return;
    }

    const name = req.body.name;
    const password = req.body.password;
    try {
        const user = await db.getUserByName(name);
        if (user.password === password) {
            sess.isLogined = true;
            res.redirect("/chat");
        } else {
            console.log("invalid password");
            res.status(401).end();
        }
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

app.get("/register", redirectChatWhenLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    res.sendFile("register.html", {
        root: "public",
    }, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Send");
        }
    });
});

app.post("/register", async (req: Request, res: Response) => {
    const sess = req.session;
    if (sess === undefined) {
        console.log("session not working");
        res.status(500).end();
        return;
    }

    const name = req.body.name;
    const password = req.body.password;
    try {
        if (!(await db.hasUserName(name))) { 
            const userId = await db.insertUser({
                name: name,
                password: password
            });
            sess.userId = userId;
            sess.name = name;
            sess.isLogined = true;
            res.redirect("/chat");
        } else { 
            console.log("name has already exists; reject");
            res.status(401).end();
        }
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

(async function startServer() {
    try {
        await initializeDB();
        await db.initializeDB();

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
