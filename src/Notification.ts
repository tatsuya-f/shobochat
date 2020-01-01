
export enum NotifyKind {
    New, Changed, All
}

export interface Notification {
    kind: NotifyKind;
    payload?: any;
}

export function isNotification(args: any): args is Notification {
    return (args.kind === NotifyKind.Changed ||
            args.kind === NotifyKind.New ||
            args.kind === NotifyKind.All);
}
