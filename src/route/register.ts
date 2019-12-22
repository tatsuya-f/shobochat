import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { redirectChatWhenLoggedIn } from "../loginHandler";
import { hasUserName, insertUser } from "../dbHandler";

export const registerRouter = express.Router();

registerRouter.get("/", redirectChatWhenLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    res.sendFile("register.html", {
        root: "public",
    }, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Send");
        }
    });
});

registerRouter.post("/", async (req: Request, res: Response) => {
    const sess = req.session;
    if (sess === undefined) {
        console.log("session not working");
        res.status(500).end();
        return;
    }

    const name = req.body.name;
    const password = req.body.password;
    try {
        if (!(await hasUserName(name))) { 
            const userId = await insertUser(name, password);
            sess.userId = userId;
            sess.isLoggedin = true;
            res.redirect("/chat");
        } else { 
            console.log("name has already exists; reject");
            res.status(401).end();
        }
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});
