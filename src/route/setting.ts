import * as express from "express";
import { hasUserName, updateUser } from "../dbHandler";
import { hash } from "../hashPassword";

export const settingRoute = express.Router();

settingRoute.get("/", async (req, res, next) => {
    res.sendFile("setting.html", {
        root: "public",
    }, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Send");
        }
    });
});


settingRoute.put("/", async (req, res) => {
    const sess = req.session;
    if (sess === undefined) {
        console.log("session not working");
        res.status(401).end();
        return;
    }

    const userId = sess.userId;
    const name = req.body.name;
    const password = req.body.password;

    try {
        if (await hasUserName(name)) {
            res.status(401).end();
        } else {
            updateUser(userId, name, hash(password));
            res.status(200).end();
        }
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});
