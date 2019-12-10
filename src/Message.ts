
export interface Message {
    id?: number;
    userId?: number;
    time?: number;
    name: string;
    message: string;
}

export function isMessage(arg: any): arg is Message {
    return (arg.id === undefined || typeof arg.id === "number") &&
        (arg.userId === undefined || typeof arg.id === "number") &&
        (arg.time === undefined || typeof arg.id === "number") &&
        typeof arg.name === "string" &&
        typeof arg.message === "string";
}
