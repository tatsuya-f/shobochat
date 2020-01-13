import { Validator } from "class-validator";

export function escapeHTML(str: string): string {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#x27;");
    str = str.replace(/`/g, "&#x60;");
    return str;
}

const validator = new Validator();

export function isValidChannelName(name: string): boolean {
    const minLength = 1;
    const maxLength = 20;
    return validator.length(name, minLength, maxLength) && validator.matches(name, /^[0-9a-z_]+$/i);
}

export function isValidUsername(name: string): boolean {
    const minLength = 1;
    const maxLength = 40;
    return validator.length(name, minLength, maxLength);
}

export function isValidUserpass(password: string): boolean {
    const minLength = 4;
    const maxLength = 50;
    return validator.length(password, minLength, maxLength);
}
