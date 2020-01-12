import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { NotificationManager } from "../notification/NotificationManager";
import { answerIsPrime } from "../handler/primeHandler";
import { shobot } from "../server";
import { DatabaseManager } from "../database/DatabaseManager";
import { MessageRepository } from "../database/repository/MessageRepository";
import { ChannelRepository } from "../database/repository/ChannelRepository";

export const messagesRouter = express.Router();
const notificationManager: NotificationManager = NotificationManager.getInstance();

const numInitMessage = 10;
messagesRouter.get("/init/:channel", async (req: Request, res: Response, next: NextFunction) => {
    const databaseManager = await DatabaseManager.getInstance();
    const messageRepository = databaseManager.getRepository(MessageRepository);

    try {
        const channel = req.params.channel;
        const messages = await messageRepository
            .getBeforeSpecifiedTime(channel, Date.now(), numInitMessage);
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

messagesRouter.get("/all/:channel", async (req: Request, res: Response, next: NextFunction) => {
    const databaseManager = await DatabaseManager.getInstance();
    const messageRepository = databaseManager.getRepository(MessageRepository);

    try {
        const channel = req.params.channel;
        const messages = await messageRepository.getAll(channel);
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

messagesRouter.get("/id/:id", async (req: Request, res: Response, next: NextFunction) => {
    const databaseManager = await DatabaseManager.getInstance();
    const messageRepository = databaseManager.getRepository(MessageRepository);

    try {
        const message = await messageRepository.getById(req.params.id);
        res.json(message);
    } catch (err) {
        next(err);
    }
});

messagesRouter.get("/time-after/:channel/:time", async (req: Request, res: Response, next: NextFunction) => {
    const databaseManager = await DatabaseManager.getInstance();
    const messageRepository = databaseManager.getRepository(MessageRepository);

    try {
        const channel = req.params.channel;
        const time = parseInt(req.params.time);
        const messages = await messageRepository.getAllAfterSpecifiedTime(channel, time);
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

messagesRouter.get("/time-before/:channel/:time/:num", async (req: Request, res: Response, next: NextFunction) => {
    const databaseManager = await DatabaseManager.getInstance();
    const messageRepository = databaseManager.getRepository(MessageRepository);

    try {
        const channel = req.params.channel;
        const time = parseInt(req.params.time);
        const num = parseInt(req.params.num);
        const messages = await messageRepository.getBeforeSpecifiedTime(channel, time, num);
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

messagesRouter.post("/:channel", async (req: Request, res: Response, next: NextFunction) => {
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

        const databaseManager = await DatabaseManager.getInstance();
        const messageRepository = databaseManager.getRepository(MessageRepository);

        const channel = req.params.channel;
        const primeAns = answerIsPrime(req.body.content);
        if (primeAns !== null) {
            await messageRepository.insertAndGetId(channel, shobot, primeAns);
        }
        await messageRepository.insertAndGetId(channel, sess.userId, req.body.content);
        await notificationManager.notifyClientsOfNewMessage(channel);
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

messagesRouter.put("/:channel/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const databaseManager = await DatabaseManager.getInstance();
        const messageRepository = databaseManager.getRepository(MessageRepository);
        const channelRepository = databaseManager.getRepository(ChannelRepository);

        const sess = req.session;
        if (sess === undefined) {
            console.log("session not working");
            res.status(500).end();
            return;
        }
        const channel = req.params.channel;
        if (!channelRepository.hasName(channel)) {
            console.log(`no such a channel named ${channel}`);
            res.status(405).end();
            return;
        }
        const messageId = req.params.id;
        const message = await messageRepository.getById(messageId);
        if (message.userId === sess.userId) { // reject
            await messageRepository.updateById(messageId, req.body.content);
            await notificationManager.notifyClientsOfChangedMessage(channel, messageId);
            res.status(200).end();
        } else {
            res.status(405).end();
        }
    } catch (err) {
        next(err);
    }
});

messagesRouter.delete("/:channel/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const databaseManager = await DatabaseManager.getInstance();
        const messageRepository = databaseManager.getRepository(MessageRepository);
        const channelRepository = databaseManager.getRepository(ChannelRepository);

        const sess = req.session;
        if (sess === undefined) {
            res.status(405).end();
            return;
        }
        const messageId = req.params.id;
        const channel = req.params.channel;
        if (!channelRepository.hasName(channel)) { // reject
            console.log(`no such a channel named ${channel}`);
            res.status(405).end();
            return;
        }
        const message = await messageRepository.getById(messageId);
        if (message.userId === sess.userId) { // accept
            await messageRepository.deleteById(messageId);
            notificationManager.notifyClientsOfDeleteMessage(channel, messageId);
            res.status(200).end();
        } else { // reject
            res.status(405).end();
        }
    } catch (err) {
        next(err);
    }
});
