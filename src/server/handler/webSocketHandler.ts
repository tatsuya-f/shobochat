import { getConnection } from "typeorm";
import { Notification, NotifyKind } from "../../common/Notification";
import { wss } from "../server";
import { ChannelRepository } from "../repository/ChannelRepository";

export function notifyClients(notification: Notification) {
    // 接続されている各Clientにsendする
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(notification));
    });
}

export async function initMessages() {
    const channelRepository = getConnection()
        .getCustomRepository(ChannelRepository);
    notifyClients({
        kind: NotifyKind.Init,
        payload: {
            channels: await channelRepository.getAll()
        }
    });
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

