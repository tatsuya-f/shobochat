import * as express from "express";
import * as session from "express-session";
import * as expressWs from "express-ws";
import {
    initializeDB,
    getMessage,
    getAllMessages,
    insertMessage,
    deleteMessage
} from "./dbHandler";
import * as uuid from "uuid";
import * as WebSocket from "ws";
import { Request, Response, NextFunction } from "express";

const exWs = expressWs(express());
export const app = exWs.app;

async function sendAllMessage() {
    const wss: WebSocket.Server = exWs.getWss(); // 接続を管理するServer．Clientと接続されるとこいつが記憶してる（実際はexWsだが）
    const messages = await getAllMessages();
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(messages)); // 接続されている各Clientにsendする
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
        maxAge: 60 * 1000 // 1 min
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
    ws.on("message", async (recvJsonData) => { // 接続完了後Client側でsendするとServerのmessage eventが発火
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
