import { getConnection } from "typeorm";
import { Notification, NotifyKind } from "../../common/Notification";
import { wss } from "../server";
import { MessageRepository } from "../repository/MessageRepository";

export function notifyClients(notification: Notification) {
    // 接続されている各Clientにsendする
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(notification));
    });
}

export async function initMessages() {
    const messageRepository = getConnection()
        .getCustomRepository(MessageRepository);
    const numInitMessage = 10;

    notifyClients({
        kind: NotifyKind.Init,
        payload: await messageRepository.getBeforeSpecifiedTime(Date.now(), numInitMessage)
    });
}

export function notifyNewMessage() {
    notifyClients({
        kind: NotifyKind.MsgNew,
    });
}

export function notifyChangedMessage(messageId: string) {
    notifyClients({
        kind: NotifyKind.MsgChanged,
        payload: messageId
    });
}

export function notifyDeleteMessage(messageId: string) {
    notifyClients({
        kind: NotifyKind.MsgDeleted,
        payload: messageId
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

