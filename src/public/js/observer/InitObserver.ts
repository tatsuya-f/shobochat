import { Observer } from "./Observer";
import { Notification, NotifyKind } from "../../../common/Notification";
import { isChannelArray } from "../../../common/Channel";
import { MessageManager } from "../MessageManager";
import { ChannelManager } from "../clientChat";

export class InitObserver extends Observer {

    private readonly messageManager: MessageManager;
    private readonly channelManager: ChannelManager;

    constructor (notify: Notification, messageManager: MessageManager, channelManager: ChannelManager) {
        super(notify);
        this.messageManager = messageManager;
        this.channelManager = channelManager;
    }

    async update() {
        switch (this.notify.kind) {
            case NotifyKind.Init: {
                if (isChannelArray(this.notify.payload.channels)) {
                    this.channelManager.channels = this.notify.payload.channels;
                }
                await this.messageManager.initialize();
                break;
            }
        }
    }
}
