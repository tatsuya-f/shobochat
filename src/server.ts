import * as express from "express";
import * as session from "express-session";
import {
    initializeDB,
    getMessage,
    getAllMessages,
    insertMessage,
    deleteMessage
} from "./dbHandler";
import * as uuid from "uuid";
import { Application, Request, Response, NextFunction } from "express";

export const app: Application = express();

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
        if (sess === undefined) { return; }
        if (sess.userId === undefined) {
            sess.userId = uuid();
        }
        const insertableMessage = {
            userId: sess.userId,
            name: req.body.name,
            message: req.body.message
        };
        await insertMessage(insertableMessage);
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

app.delete("/messages/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sess = req.session;
        if (sess === undefined) { // reject
            return;
        }
        const messageId = parseInt(req.params.id);
        const message = await getMessage(messageId);
        if (message.userId === sess.userId) { // accept
            await deleteMessage(messageId);
            res.status(200).end();
        }
        else { // reject
            res.status(500).end();
        }
    } catch (err) {
        next(err);
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
