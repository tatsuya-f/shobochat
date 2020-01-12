import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { DatabaseManager } from "../database/DatabaseManager";
import { ChannelRepository } from "../database/repository/ChannelRepository";
import { NotificationManager } from "../notification/NotificationManager";

export const channelsRouter = express.Router();
const notificationManager: NotificationManager = NotificationManager.getInstance();

channelsRouter.post("/:channel", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const databaseManager = await DatabaseManager.getInstance();
        const channelRepository = databaseManager.getRepository(ChannelRepository);

        const channel = req.params.channel;
        if (await channelRepository.hasName(channel)) {
            res.status(405).end();
        } else {
            await channelRepository.insertAndGetId(channel);
            notificationManager.notifyClientsOfNewChannel(channel);
            res.status(200).end();
        }
    } catch (err) {
        next(err);
    }
});

channelsRouter.delete("/:channel", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const databaseManager = await DatabaseManager.getInstance();
        const channelRepository = databaseManager.getRepository(ChannelRepository);

        const channel = req.params.channel;
        if (await channelRepository.hasName(channel)) {
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
