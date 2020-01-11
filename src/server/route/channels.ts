import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { DatabaseManager } from "../database/DatabaseManager";
import { ChannelRepository } from "../repository/ChannelRepository";
import { notifyNewChannel } from "../handler/webSocketHandler";

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
            notifyNewChannel(await channelRepository.getAll());
            res.status(200).end();
        }
    } catch (err) {
        next(err);
    }
});
