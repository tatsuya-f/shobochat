import { Observer } from "./observer/Observer";
import { Notification, NotifyKind } from "../../common/Notification";
import { Channel } from "../../common/Channel";
import { MessageManager } from "./MessageManager";
import { ChannelManager } from "./clientChat";
import { InitObserver } from "./observer/InitObserver";
import { MessageObserver } from "./observer/MessageObserver";
import { UserObserver } from "./observer/UserObserver";
import { ChannelObserver } from "./observer/ChannelObserver";


export class ObserverManager {

    static getObserver(notify: Notification, messageManager: MessageManager, channelManager: ChannelManager): Observer|undefined {
        switch (notify.kind) {

            // create InitObserver
            case NotifyKind.Init: {
                return new InitObserver(notify, messageManager, channelManager);
            }

            // create MessageObserver
            case NotifyKind.MsgNew: 
            case NotifyKind.MsgChanged: 
            case NotifyKind.MsgDeleted: {
                return new MessageObserver(notify, messageManager)
            }

            // create UserObserver
            case NotifyKind.UserChanged: {
                return new UserObserver(notify, messageManager);
            }

            // create ChannelObserver
            case NotifyKind.ChanNew: 
            case NotifyKind.ChanDeleted: {
                return new ChannelObserver(notify, channelManager);
            }

            default: {
                return undefined;
            }
        }
    }
}
