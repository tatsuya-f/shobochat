import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { getConnection } from "typeorm";
import { redirectChatWhenLoggedIn } from "../handler/loginHandler";
import { hash } from "../handler/hashHandler";
import { UserRepository } from "../repository/UserRepository";

export const registerRouter = express.Router();
const connectionType: string = process.env.TYPEORM_CONNECTION_TYPE || "default";

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

    const userRepository = getConnection(connectionType)
        .getCustomRepository(UserRepository); 

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
