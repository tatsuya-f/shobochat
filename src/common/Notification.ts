
export enum NotifyKind {
    Init, New, Changed, Deleted
}

export interface Notification {
    kind: NotifyKind;
    payload?: any;
}

export function isNotification(args: any): args is Notification {
    return (
        args.kind === NotifyKind.Init ||
        args.kind === NotifyKind.Changed ||
        args.kind === NotifyKind.New ||
        args.kind === NotifyKind.Deleted
    );
}
