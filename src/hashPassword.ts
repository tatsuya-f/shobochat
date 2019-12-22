import * as CryptoTS from "crypto-ts";

const key = "shobo";

export function encrypt(password: string): string {
    return CryptoTS.AES.encrypt(password, key).toString();
}

export function decrypt(hashed: string): string {
    return CryptoTS.AES.decrypt(hashed, key).toString(CryptoTS.enc.Utf8);
}
