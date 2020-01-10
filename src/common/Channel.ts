export const defaultChannel = "general";
export const defaultChannelList = [defaultChannel, "random"];

export interface Channel {
    id: number;
    name: string;
}

export function isChannel(arg: any): arg is Channel {
    return typeof arg.id === "number" &&
        typeof arg.name === "string";
}

export function isChannelArray(arg: any): arg is Array<Channel> {
    if (!Array.isArray(arg)) { return false; }
    arg.forEach(c => {
        if (!isChannel(c)) { return false; }
    });
    return true;
}
