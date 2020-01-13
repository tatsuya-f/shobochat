import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { escapeHTML } from "../../common/validate";
import { isValidChannelName } from "../../common/validate";
import { DatabaseManager } from "../database/DatabaseManager";
import { ChannelRepository } from "../database/repository/ChannelRepository";
import { NotificationManager } from "../notification/NotificationManager";

export const channelsRouter = express.Router();
const notificationManager: NotificationManager = NotificationManager.getInstance();
const databaseManager: DatabaseManager = DatabaseManager.getInstance();

channelsRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const channelRepository = databaseManager.getRepository(ChannelRepository);
        const channel = escapeHTML(req.body.channel);
        if (await channelRepository.hasName(channel)) {
            res.status(405).end();
        } else if (!isValidChannelName(channel)) {
            res.status(400).end();
        } else {
            await channelRepository.insertAndGetId(channel);
            notificationManager.notifyClientsOfNewChannel(channel);
            res.status(200).end();
        }
    } catch (err) {
        next(err);
    }
});

channelsRouter.delete("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const channelRepository = databaseManager.getRepository(ChannelRepository);
        const channel = req.body.channel;
        if (await channelRepository.hasName(channel)) {
            console.log("delete " + channel);
            await channelRepository.deleteByName(channel);
            notificationManager.notifyClientsOfDeletedChannel(channel);
            res.status(200).end();
        } else {
            res.status(405).end();
        }
    } catch (err) {
        next(err);
    }
});
