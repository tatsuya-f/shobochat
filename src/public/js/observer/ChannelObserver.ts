import { Observer } from "./Observer";
import { Notification, NotifyKind } from "../../../common/Notification";
import { Channel } from "../../../common/Channel";
import { ChannelManager } from "../clientChat";

export class ChannelObserver extends Observer {

    private readonly channelManager: ChannelManager;

    constructor (notify: Notification, channelManager: ChannelManager) {
        super(notify);
        this.channelManager = channelManager;
    };

    async update() {
        switch (this.notify.kind) {
            case NotifyKind.ChanNew: {
                if (typeof this.notify.payload === "string") {
                    this.channelManager.add(this.notify.payload);
                }
                break;
            }
            case NotifyKind.ChanDeleted: {
                if (typeof this.notify.payload === "string") {
                    this.channelManager.del(this.notify.payload);
                }
                break;
            }
        }
    }
}
