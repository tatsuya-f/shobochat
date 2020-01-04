import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { getConnection } from "typeorm";
import {
    notifyNewMessage,
    notifyChangedMessage,
    notifyDeleteMessage, } from "../handler/webSocketHandler";
import { answerIsPrime } from "../handler/primeHandler";
import { shobot } from "../server";
import { MessageRepository } from "../repository/MessageRepository";

export const messagesRouter = express.Router();
const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";

messagesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const messageRepository = getConnection(connectionType)
        .getCustomRepository(MessageRepository); // global で宣言するとうまくいかない
    try {
        const messages = await messageRepository.getAll();
        res.json(messages);
    } catch (err) {
        next(err);
    }
});
messagesRouter.get("/id/:id", async (req: Request, res: Response, next: NextFunction) => {
    const messageRepository = getConnection(connectionType)
        .getCustomRepository(MessageRepository); // global で宣言するとうまくいかない
    try {
        const message = await messageRepository.getById(req.params.id);
        res.json(message);
    } catch (err) {
        next(err);
    }
});

messagesRouter.get("/time-after/:time", async (req: Request, res: Response, next: NextFunction) => {
    const messageRepository = getConnection(connectionType)
        .getCustomRepository(MessageRepository); // global で宣言するとうまくいかない
    try {
        const time = parseInt(req.params.time);
        const messages = await messageRepository.getAllAfterSpecifiedTime(time);
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

messagesRouter.get("/time-before/:time/:num", async (req: Request, res: Response, next: NextFunction) => {
    const messageRepository = getConnection(connectionType)
        .getCustomRepository(MessageRepository); // global で宣言するとうまくいかない
    try {
        const time = parseInt(req.params.time);
        const num = parseInt(req.params.num);
        const messages = await messageRepository.getBeforeSpecifiedTime(time, num);
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

        const messageRepository = getConnection(connectionType)
            .getCustomRepository(MessageRepository); // global で宣言するとうまくいかない
        await messageRepository.insertAndGetId(sess.userId, req.body.content);
        const primeAns = answerIsPrime(req.body.content);
        if (primeAns !== null) {
            await messageRepository.insertAndGetId(shobot, primeAns);
        }
        await notifyNewMessage();
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

messagesRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const messageRepository = getConnection(connectionType)
        .getCustomRepository(MessageRepository); // global で宣言するとうまくいかない
    try {
        const sess = req.session;
        if (sess === undefined) {
            console.log("session not working");
            res.status(500).end();
            return;
        }

        const messageId = req.params.id;
        const message = await messageRepository.getById(messageId);
        if (message.userId === sess.userId) {
            await messageRepository.updateById(messageId, req.body.content);
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
    const messageRepository = getConnection(connectionType)
        .getCustomRepository(MessageRepository); // global で宣言するとうまくいかない
    try {
        const sess = req.session;
        if (sess === undefined) {
            res.status(405).end();
            return;
        }
        const messageId = req.params.id;
        const message = await messageRepository.getById(messageId);
        if (message.userId === sess.userId) { // accept
            await messageRepository.deleteById(messageId);
            notifyDeleteMessage(messageId);
            res.status(200).end();
        } else { // reject
            res.status(405).end();
        }
    } catch (err) {
        next(err);
    }
});
