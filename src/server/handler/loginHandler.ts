import { Request, Response, NextFunction } from "express";

export function checkLogin(req: Request, res: Response, next: NextFunction) {
    const sess = req.session;
    if (sess === undefined || !sess.isLoggedin) {
        res.redirect("/"); // ログインしていない場合は top へ
    } else {
        next(); // ログインしているときは，次の middleware へ
    }
}

export function redirectChatWhenLoggedIn(req: Request, res: Response, next: NextFunction) {
    const sess = req.session;
    if (sess !== undefined && sess.isLoggedin) {
        res.redirect("/chat");
    } else {
        next();
    }
}
