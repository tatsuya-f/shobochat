
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

export function isMessageArray(arg: any): arg is Array<Message> {
    if (!Array.isArray(arg)) { return false; }
    arg.forEach(m => {
        if (!isMessage(m)) { return false; }
    });
    return true;
}
