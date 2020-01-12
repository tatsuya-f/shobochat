import * as WebSocket from "ws";
import { Notification, NotifyKind } from "../../common/Notification";
import { DatabaseManager } from "../database/DatabaseManager";
import { ChannelRepository } from "../database/repository/ChannelRepository";

// NotificationManager と抽象化しておくことで，内部実装を WebSocket 以外にも変更できるようにする
export class NotificationManager {

    private static readonly instance: NotificationManager = new NotificationManager(
        parseInt(process.env.NOTIFICATION_MANAGER_PORT || "8080")
    );

    // 唯一の NotificationManager が initialize されているかどうかを表す
    private static isInitialized: boolean = false;

    private readonly _webSocketServer: WebSocket.Server;

    private constructor(port: number) {
        this._webSocketServer = new WebSocket.Server({ port: port });
        console.log("NotificationManager listening on port " + port);
    }

    static getInstance(): NotificationManager {
        /*
         * initialize されていない NotificationManager を返すのを許容しているのは，
         * グローバルで getInstance を可能にするためである．
         * もしもここで，initialize されていない NotificationManager を返せない
         * ようにすると，実行時（動的）に getInstance より前で initialize をしていたとしても
         * トランスパイル時に getInstance によってグローバル変数への代入をしている
         * 部分が先に実行されるため，エラーがでてしまう．
         *
         * initialize されていない場合のエラー処理は，private な getter 内で行う．
         */
        return NotificationManager.instance;
    }

    /* 
     * public method から，NotificationManager のメンバーにアクセスする場合
     * NotificationManager が initialize されていない可能性があるので
     * 以下の private な getter を使用する
     */ 
    private get webSocketServer() {
        if (!NotificationManager.isInitialized) {
            console.log("notificationManager hasn't been intialized");
            throw new Error("notificationManager hasn't been intialized");
        }
        return this._webSocketServer;
    }

    static async initialize() {
        NotificationManager.isInitialized = true;

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
        this._webSocketServer.on("connection", (ws) => {
            // 接続完了後Client側でsendするとServerのmessage eventが発火
            ws.on("message", async () => {
                console.log("WebSocket connected");
                await this.initMessages(ws);
            });
        });
    }

    notifyClients(notification: Notification) {
        // 接続されている各Clientにsendする
        this.webSocketServer.clients.forEach(ws => {
            ws.send(JSON.stringify(notification));
        });
    }

    /* 
     * このクラスが大きくなりすぎる場合は，
     * 以下のメソッド群を
     * notify する種類ごとにわけて，
     * それぞれ NotificationManager を
     * 内部に持つクラスに入れる．
     */
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
