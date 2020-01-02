import { getBeforeMessages } from "./dbHandler";
import { Notification, NotifyKind } from "./Notification";
import { wss } from "./server";

export function notifyClients(notification: Notification) {
    // 接続されている各Clientにsendする
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(notification));
    });
}

export async function initMessages() {
    // 接続を管理するServer．Clientと接続されるとこいつが記憶してる（実際はexWsだが）
    // const messages = await getAllMessages();
    notifyClients({
        kind: NotifyKind.Init,
        payload: await getBeforeMessages(Date.now(), 10)
    });
}

export function notifyNewMessage() {
    notifyClients({
        kind: NotifyKind.New,
    });
}

export function notifyChangedMessage(messageId: string) {
    notifyClients({
        kind: NotifyKind.Changed,
        payload: messageId
    });
}

export function notifyDeleteMessage(messageId: string) {
    notifyClients({
        kind: NotifyKind.Deleted,
        payload: messageId
    });
}

