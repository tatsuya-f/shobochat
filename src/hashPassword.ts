import * as CryptoJS from "crypto-js";

export function hash(password: string): string {
    return CryptoJS.SHA256(password).toString();
}
