import * as WebSocket from "ws";
import { Notification, NotifyKind } from "../../common/Notification";
import { DatabaseManager } from "../database/DatabaseManager";
import { ChannelRepository } from "../database/repository/ChannelRepository";

// NotificationManager と抽象化しておくことで，内部実装を WebSocket 以外にも変更できるようにする
export class NotificationManager {

    private static readonly instance: NotificationManager = new NotificationManager(
        parseInt(process.env.NOTIFICATION_MANAGER_PORT || "8080")
    );

    private readonly webSocketServer: WebSocket.Server;

    private isInitialized: boolean = false;

    private constructor(port: number) {
        this.webSocketServer = new WebSocket.Server({ port: port });
        console.log("NotificationManager listening on port " + port);
    }

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance.isInitialized) {
            throw new Error("notificationManager hasn't been intialized");
        }
        return NotificationManager.instance;
    }

    static async initialize() {
        NotificationManager.instance.isInitialized = true;

        try {
            await NotificationManager.instance.startListeningToEvent();
        } catch (err) {
            console.log(err);
            throw new Error("initialize failed");
        }
    }

    private async initMessages(ws: WebSocket) {
        const databaseManager = await DatabaseManager.getInstance(); 
        const channelRepository = databaseManager.getRepository(ChannelRepository);

        ws.send(JSON.stringify({
            kind: NotifyKind.Init,
            payload: {
                channels: await channelRepository.getAll()
            }
        }));
    }

    private async startListeningToEvent() {
        this.webSocketServer.on("connection", (ws) => {
            // 接続完了後Client側でsendするとServerのmessage eventが発火
            ws.on("message", async () => {
                console.log("WebSocket connected");
                await this.initMessages(ws);
            });
        });
    }

    private notifyClients(notification: Notification) {
        // 接続されている各Clientにsendする
        this.webSocketServer.clients.forEach(ws => {
            ws.send(JSON.stringify(notification));
        });
    }

    notifyClientsOfNewMessage(channel: string) {
        this.notifyClients({
            kind: NotifyKind.MsgNew,
            payload: {
                channel
            }
        });
    }

    notifyClientsOfChangedMessage(channel: string, messageId: string) {
        this.notifyClients({
            kind: NotifyKind.MsgChanged,
            payload: {
                messageId,
                channel
            }
        });
    }

    notifyClientsOfDeleteMessage(channel: string, messageId: string) {
        this.notifyClients({
            kind: NotifyKind.MsgDeleted,
            payload: {
                messageId,
                channel
            }
        });
    }

    notifyClientsOfChangedUsername(oldName: string, newName: string) {
        this.notifyClients({
            kind: NotifyKind.UserChanged,
            payload: {
                oldName, newName
            }
        });
    }

    notifyClientsOfNewChannel(channel: string) {
        this.notifyClients({
            kind: NotifyKind.ChanNew,
            payload: channel
        });
    }

    notifyClientsOfDeletedChannel(channel: string) {
        this.notifyClients({
            kind: NotifyKind.ChanDeleted,
            payload: channel
        });
    }
}
