import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { redirectChatWhenLoggedIn } from "../handler/loginHandler";
import { hash } from "../handler/hashHandler";
import { isValidUsername, isValidUserpass, escapeHTML } from "../../common/validate";
import { DatabaseManager } from "../database/DatabaseManager";
import { UserRepository } from "../database/repository/UserRepository";

export const registerRouter = express.Router();

const databaseManager: DatabaseManager = DatabaseManager.getInstance();

registerRouter.get("/", redirectChatWhenLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    res.sendFile(
        "register.html",
        {
            root: "../public"
        },
        err => {
            if (err) {
                next(err);
            } else {
                console.log("Send");
            }
        }
    );
});

registerRouter.post("/", async (req: Request, res: Response) => {
    const sess = req.session;
    if (sess === undefined) {
        console.log("session not working");
        res.status(401).end();
        return;
    }

    const userRepository = databaseManager.getRepository(UserRepository);

    const name = escapeHTML(req.body.name);
    const password = req.body.password;
    try {
        if (await userRepository.hasName(name)) {
            console.log("name has already exists; reject");
            res.status(401).end();
        } else if (!isValidUsername(name) || !isValidUserpass(password)) {
            res.status(400).end();
        } else {
            const userId = await userRepository.insertAndGetId(name, hash(password));
            sess.userId = userId;
            sess.isLoggedin = true;
            res.redirect("/chat");
        }
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});
