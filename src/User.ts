"use strict";

export interface User { 
    id: number; 
    name: string; 
    password: string; 
}

export function isUser(arg: any): arg is User {
    return typeof arg.id === "number" &&
        typeof arg.name === "string" &&
        typeof arg.password === "string";
}
