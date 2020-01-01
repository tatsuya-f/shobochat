import { getAllMessages } from "./dbHandler";
import { Notification, NotifyKind } from "./Notification";
import { wss } from "./server";

export function notifyClients(notification: Notification) {
    // 接続されている各Clientにsendする
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(notification));
    });
}

export async function broadcastMessages() {
    // 接続を管理するServer．Clientと接続されるとこいつが記憶してる（実際はexWsだが）
    const messages = await getAllMessages();
    notifyClients({
        kind: NotifyKind.All,
        payload: messages
    });
}

export function notifyNewMessage() {
    notifyClients({
        kind: NotifyKind.New,
    });
}

export function notifyChangedMessage() {
    notifyClients({
        kind: NotifyKind.Changed
    });
}
