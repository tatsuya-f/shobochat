import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { redirectChatWhenLoggedIn } from "../loginHandler";

export const indexRouter = express.Router();

indexRouter.get("/", redirectChatWhenLoggedIn, (req: Request, res: Response, next: NextFunction) => {
    next();
});
