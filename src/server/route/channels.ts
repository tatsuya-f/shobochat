import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { getConnection } from "typeorm";
import { ChannelRepository } from "../repository/ChannelRepository";
import { notifyNewChannel } from "../handler/webSocketHandler";

export const channelsRouter = express.Router();
const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";

channelsRouter.post("/:channel", async (req: Request, res: Response, next: NextFunction) => {
    const channelRepository = getConnection(connectionType)
        .getCustomRepository(ChannelRepository); // global で宣言するとうまくいかない
    try {
        const channel = req.params.channel;
        console.log(channel);
        if (await channelRepository.hasName(channel)) {
            res.status(405).end();
        } else {
            const id = await channelRepository.insertAndGetId(channel);
            console.log(id);
            notifyNewChannel(await channelRepository.getAll());
            res.status(200).end();
        }
    } catch (err) {
        next(err);
    }
});
