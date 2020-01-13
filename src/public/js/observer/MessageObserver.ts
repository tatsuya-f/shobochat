import { Observer } from "./Observer";
import { Notification, NotifyKind } from "../../../common/Notification";
import { Channel } from "../../../common/Channel";
import { MessageManager } from "../MessageManager";

export class MessageObserver extends Observer {

    private readonly messageManager: MessageManager;

    constructor (notify: Notification,  messageManager: MessageManager) {
        super(notify);
        this.messageManager = messageManager;
    };

    async update() {
        switch (this.notify.kind) {
            case NotifyKind.MsgNew: {
                const channel = this.notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== this.messageManager.channel) { break; }

                await this.messageManager.getNew();
                break;
            }
            case NotifyKind.MsgChanged: {
                const channel = this.notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== this.messageManager.channel) { break; }

                if (typeof this.notify.payload.messageId === "string") {
                    await this.messageManager.fetch(this.notify.payload.messageId);
                }
                break;
            }
            case NotifyKind.MsgDeleted: {
                const channel = this.notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== this.messageManager.channel) { break; }

                if (typeof this.notify.payload.messageId === "string") {
                    await this.messageManager.onDeleteEvent(this.notify.payload.messageId);
                }
                break;
            }
        }
    }
}
