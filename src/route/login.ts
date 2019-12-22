import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { User } from "../User";
import { redirectChatWhenLoggedIn } from "../loginHandler";
import { getUserByName } from "../dbHandler";
import { decrypt } from "../hashPassword";

export const loginRouter = express.Router();

loginRouter.get("/", redirectChatWhenLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    res.sendFile("login.html", {
        root: "public",
    }, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Send");
        }
    });
});

loginRouter.post("/", async (req: Request, res: Response) => {
    const sess = req.session;
    if (sess === undefined) {
        console.log("session not working");
        res.status(401).end();
        return;
    }

    const name = req.body.name;
    const password = req.body.password;
    try {
        const user: User = await getUserByName(name);
        if (user === undefined) {
            console.log("invalid username");
            res.status(401).end();
        } else if (decrypt(user.password) !== password) {
            console.log("invalid password");
            res.status(401).end();
        } else {
            sess.userId = user.id;
            sess.isLoggedin = true;
            res.redirect("/chat");
        }
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});
