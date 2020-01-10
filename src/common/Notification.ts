
export enum NotifyKind {
    Init, MsgNew, MsgChanged, MsgDeleted,
    UserChanged,
    ChanNew, ChanDeleted, ChanChanged
}

export interface Notification {
    kind: NotifyKind;
    payload?: any;
}

export function isNotification(args: any): args is Notification {
    return (
        args.kind === NotifyKind.Init ||
        args.kind === NotifyKind.MsgChanged ||
        args.kind === NotifyKind.MsgNew ||
        args.kind === NotifyKind.MsgDeleted ||

        args.kind === NotifyKind.UserChanged ||

        args.kind === NotifyKind.ChanNew ||
        args.kind === NotifyKind.ChanDeleted ||
        args.kind === NotifyKind.ChanChanged
    );
}
