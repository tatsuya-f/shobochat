
export interface Message {
    id?: number;
    time?: number;
    name: string;
    message: string;
}

export function isMessage(arg: any): arg is Message {
    return typeof arg.name === "string" && typeof arg.message === "string" && (arg.id === undefined || typeof arg.id === "number") && (arg.id === undefined || typeof arg.id === "number");
}
