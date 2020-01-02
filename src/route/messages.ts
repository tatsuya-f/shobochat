import * as express from "express";
import { Request, Response, NextFunction } from "express";
import {
    getMessage,
    getAllMessages,
    getBeforeMessages,
    getAfterMessages,
    insertMessage,
    deleteMessage,
    updateMessage } from "../dbHandler";
import {
    notifyNewMessage,
    notifyChangedMessage,
    notifyDeleteMessage, } from "../webSocketHandler";
import { answerIsPrime } from "../primeHandler";
import { shobot } from "../server";

export const messagesRouter = express.Router();

messagesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await getAllMessages();
        res.json(messages);
    } catch (err) {
        next(err);
    }
});
messagesRouter.get("/id/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const message = await getMessage(req.params.id);
        res.json(message);
    } catch (err) {
        next(err);
    }
});

messagesRouter.get("/time-after/:time", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const time = parseInt(req.params.time);
        const messages = await getAfterMessages(time);
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

messagesRouter.get("/time-before/:time/:num", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const time = parseInt(req.params.time);
        const num = parseInt(req.params.num);
        const messages = await getBeforeMessages(time, num);
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
            res.status(405).end();
            return;
        }

        await insertMessage(sess.userId, req.body.content);
        const primeAns = answerIsPrime(req.body.content);
        if (primeAns !== null) {
            await insertMessage(shobot, primeAns);
        }
        await notifyNewMessage();
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

messagesRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sess = req.session;
        if (sess === undefined) {
            console.log("session not working");
            res.status(500).end();
            return;
        }

        const messageId = req.params.id;
        const message = await getMessage(messageId);
        if (message.userId === sess.userId) {
            await updateMessage(messageId, req.body.content);
            await notifyChangedMessage(messageId);
            res.status(200).end();
        } else {
            res.status(405).end();
        }
    } catch (err) {
        next(err);
    }
});

messagesRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sess = req.session;
        if (sess === undefined) {
            res.status(405).end();
            return;
        }
        const messageId = req.params.id;
        const message = await getMessage(messageId);
        if (message.userId === sess.userId) { // accept
            await deleteMessage(messageId);
            notifyDeleteMessage(messageId);
            res.status(200).end();
        } else { // reject
            res.status(405).end();
        }
    } catch (err) {
        next(err);
    }
});


