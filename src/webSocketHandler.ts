import { getAllMessages } from "./dbHandler";
import { wss } from "./server";

export async function broadcastMessages() {
    // 接続を管理するServer．Clientと接続されるとこいつが記憶してる（実際はexWsだが）
    const messages = await getAllMessages();

    // 接続されている各Clientにsendする
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(messages));
    });
}
