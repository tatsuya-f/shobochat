
export interface Message {
    id?: number;
    userId?: string;
    time?: number;
    name: string;
    message: string;
}

export function isMessage(arg: any): arg is Message {
    return (arg.id === undefined || typeof arg.id === "number") &&
        (arg.userId === undefined || typeof arg.userId === "string") &&
        (arg.time === undefined || typeof arg.time === "number") &&
        typeof arg.name === "string" &&
        typeof arg.message === "string";
}
