export interface UserInfo {
    name: string;
    password: string;
}

export function isUserInfo(arg: any): arg is UserInfo {
    return typeof arg.name === "string" && typeof arg.password === "string";
}
