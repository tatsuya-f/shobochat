import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { 
    getMessage,
    getAllMessages,
    insertMessage,
    deleteMessage } from "../dbHandler";
import { broadcastMessages } from "../webSocketHandler";

export const messagesRouter = express.Router();

messagesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await getAllMessages();
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

messagesRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
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

        await insertMessage(sess.userId, req.body.message);
        await broadcastMessages();
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

messagesRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
            await broadcastMessages();
            res.status(200).end();
        }
        else { // reject
            res.status(500).end();
        }
    } catch (err) {
        next(err);
    }
});


