import { Notification } from "../../../common/Notification";

export abstract class Observer {
    constructor(protected notify: Notification){};
    abstract async update(): Promise<void>;
}
