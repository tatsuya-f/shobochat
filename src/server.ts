"use strict";

import * as express from "express";
import { initializeDB, getAllMessages, insertMessage } from "./database";

var app: express.Application = express();
app.use(express.static("public"));
app.use(express.json());

app.get("/messages", (req, res) => {
    getAllMessages()
        .then((messages) => {
            res.json(messages);
        });
});

app.post("/messages", (req, res) => {
    insertMessage(req.body)
        .then(() => {
            res.end();
        });
});

initializeDB()
    .then(() => {
        app.listen(8000, () => {
            console.log("listening on port 8000");
        });
    });
