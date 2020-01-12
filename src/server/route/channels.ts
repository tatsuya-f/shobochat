import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { DatabaseManager } from "../database/DatabaseManager";
import { ChannelRepository } from "../database/repository/ChannelRepository";
import { notifyNewChannel, notifyDeletedChannel } from "../handler/webSocketHandler";

export const channelsRouter = express.Router();

channelsRouter.post("/:channel", async (req: Request, res: Response, next: NextFunction) => {
    const databaseManager = await DatabaseManager.getInstance();
    const channelRepository = databaseManager.getRepository(ChannelRepository);
    try {
        const channel = req.params.channel;
        if (await channelRepository.hasName(channel)) {
            res.status(405).end();
        } else {
            await channelRepository.insertAndGetId(channel);
            notifyNewChannel(channel);
            res.status(200).end();
        }
    } catch (err) {
        next(err);
    }
});

channelsRouter.delete("/:channel", async (req: Request, res: Response, next: NextFunction) => {
    const databaseManager = await DatabaseManager.getInstance();
    const channelRepository = databaseManager.getRepository(ChannelRepository);
    try {
        const channel = req.params.channel;
        if (await channelRepository.hasName(channel)) {
            await channelRepository.deleteByName(channel);
            notifyDeletedChannel(channel);
            res.status(200).end();
        } else {
            res.status(405).end();
        }
    } catch (err) {
        next(err);
    }
});
