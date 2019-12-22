
export interface UserInfo {
    name: string;
    password: string;
}

export type User = UserInfo & { id: number; };

export function isUserInfo(arg: any): arg is UserInfo {
    return typeof arg.name === "string" &&
        typeof arg.password === "string";
}

export function isUser(arg: any): arg is User {
    return typeof arg.id === "number" && isUserInfo(arg);
}
