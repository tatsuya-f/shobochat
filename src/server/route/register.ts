import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { redirectChatWhenLoggedIn } from "../handler/loginHandler";
import { hash } from "../handler/hashHandler";
import { DatabaseManager } from "../database/DatabaseManager";
import { UserRepository } from "../repository/UserRepository";

export const registerRouter = express.Router();

registerRouter.get("/", redirectChatWhenLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    res.sendFile("register.html", {
        root: "../public",
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
        res.status(401).end();
        return;
    }

    const databaseManager = await DatabaseManager.getInstance();
    const userRepository = databaseManager.getRepository(UserRepository);

    const name = req.body.name;
    const password = req.body.password;
    try {
        if (!(await userRepository.hasName(name))) { 
            const userId = await userRepository.insertAndGetId(name, hash(password));
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
