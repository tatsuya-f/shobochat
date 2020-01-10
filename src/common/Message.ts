
export interface Message {
    id: string;
    userId: number;
    channelName: string;
    time: number;
    name: string;
    content: string;
}

export function isMessage(arg: any): arg is Message {
    return typeof arg.id === "string" &&
        typeof arg.userId === "number" &&
        typeof arg.channelName === "string" &&
        typeof arg.time === "number" &&
        typeof arg.name === "string" &&
        typeof arg.content === "string";
}

export function toMessage(arg: any): Message {
    if (isMessage(arg)) {
        return arg;
    }
    return {
        id: arg.id,
        userId: arg.userId,
        channelName: arg.channelName,
        time: arg.time,
        name: arg.name.toString(),
        content: arg.content.toString()
    };
}

export function isMessageArray(arg: any): arg is Array<Message> {
    if (!Array.isArray(arg)) { return false; }
    arg.forEach(m => {
        if (!isMessage(m)) { return false; }
    });
    return true;
}
