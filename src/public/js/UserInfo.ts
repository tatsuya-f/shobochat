
export interface UserInfo {
    name: string;
    pass: string;
}

export function isUserInfo(arg: any): arg is UserInfo {
    return typeof arg.name === "string" && typeof arg.message === "string";
}


