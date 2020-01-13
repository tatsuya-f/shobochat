import { UserInfo, isUserInfo } from "./UserInfo";

export type User = UserInfo & { id: number };

export function isUser(arg: any): arg is User {
    return typeof arg.id === "number" && isUserInfo(arg);
}
