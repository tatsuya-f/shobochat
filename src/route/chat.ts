import * as express from "express";
import { Request, Response, NextFunction } from "express";

export const chatRouter = express.Router();

chatRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.sendFile("chat.html", {
        root: "public",
    }, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Send");
        }
    });
});
