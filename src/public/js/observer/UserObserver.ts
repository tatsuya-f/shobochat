import { Observer } from "./Observer";
import { Notification, NotifyKind } from "../../../common/Notification";
import { Channel } from "../../../common/Channel";
import { MessageManager } from "../MessageManager";

export class UserObserver extends Observer {

    private readonly messageManager: MessageManager;

    constructor (notify: Notification, messageManager: MessageManager) {
        super(notify);
        this.messageManager = messageManager;
    };

    async update() {
        switch (this.notify.kind) {
            case NotifyKind.UserChanged: {
                if (typeof this.notify.payload.newName === "string" &&
                    typeof this.notify.payload.oldName === "string") {
                    this.messageManager.onChangeUserNameEvent(
                        this.notify.payload.oldName,
                        this.notify.payload.newName
                    );
                }
                break;
            }
        }
    }
}
