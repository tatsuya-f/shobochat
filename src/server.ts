"use strict";

import * as express from "express";
import { initializeDB, getAllMessages, insertMessage } from "./database";

var app: express.Application = express();
app.use(express.static("public"));
app.use(express.json());

app.get("/messages", (req, res) => {
    (async () => {
        const messages = await getAllMessages();
        res.json(messages);
    })();
});

app.post("/messages", (req, res) => {
    (async () => {
        await insertMessage(req.body);
        res.end();
    })();
});


(async () => {
    await initializeDB();
    app.listen(8000 , () =>{
        console.log("listening on port 8000");
    });
})();

