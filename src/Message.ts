
export interface Message {
    id?: number;
    userId?: number;
    time?: number;
    name: string;
    message: string;
}

export function isMessage(arg: any): arg is Message {
    return (arg.id === undefined || typeof arg.id === "number") &&
        (arg.userId === undefined || typeof arg.userId === "number") &&
        (arg.time === undefined || typeof arg.time === "number") &&
        typeof arg.name === "string" &&
        typeof arg.message === "string";
}

export function toMessage(arg: any): Message {
    if (isMessage(arg)) {
        return arg;
    }
    return {
        id: arg.id || undefined,
        userId: arg.userId || undefined,
        time: arg.time || undefined,
        name: arg.name.toString(),
        message: arg.message.toString()
    };
}

export function isMessageArray(arg: any): arg is Array<Message> {
    if (!Array.isArray(arg)) { return false; }
    arg.forEach(m => {
        if (!isMessage(m)) { return false; }
    });
    return true;
}
