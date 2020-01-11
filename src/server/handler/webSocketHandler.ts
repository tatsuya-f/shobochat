import { getConnection } from "typeorm";
import * as WebSocket from "ws";
import { Notification, NotifyKind } from "../../common/Notification";
import { wss } from "../server";
import { ChannelRepository } from "../repository/ChannelRepository";
import { Channel } from "../../common/Channel";

export function notifyClients(notification: Notification) {
    // 接続されている各Clientにsendする
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(notification));
    });
}

export async function initMessages(ws: WebSocket) {
    const channelRepository = getConnection()
        .getCustomRepository(ChannelRepository);
    ws.send(JSON.stringify({
        kind: NotifyKind.Init,
        payload: {
            channels: await channelRepository.getAll()
        }
    }));
}

export function notifyNewMessage(channel: string) {
    notifyClients({
        kind: NotifyKind.MsgNew,
        payload: {
            channel
        }
    });
}

export function notifyChangedMessage(channel: string, messageId: string) {
    notifyClients({
        kind: NotifyKind.MsgChanged,
        payload: {
            messageId,
            channel
        }
    });
}

export function notifyDeleteMessage(channel: string, messageId: string) {
    notifyClients({
        kind: NotifyKind.MsgDeleted,
        payload: {
            messageId,
            channel
        }
    });
}

export function notifyChangedUsername(oldName: string, newName: string) {
    notifyClients({
        kind: NotifyKind.UserChanged,
        payload: {
            oldName, newName
        }
    });
}

export function notifyNewChannel(channels: Array<Channel>) {
    notifyClients({
        kind: NotifyKind.ChanNew,
        payload: channels
    });
}
