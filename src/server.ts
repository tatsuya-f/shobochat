import * as express from "express";
import { initializeDB, getAllMessages, insertMessage, deleteMessage } from "./dbHandler";
import { Application, Request, Response, NextFunction } from "express";

export const app: Application = express();

app.set("port", 8000);
app.use(express.static("public"));
app.use(express.json());

app.get("/messages", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await getAllMessages();
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

app.post("/messages", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const insertableMessage = { userId: 999, name: req.body.name, message: req.body.message }; // userIdを付与
        await insertMessage(insertableMessage);
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

app.delete("/messages/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await deleteMessage(parseInt(req.params.id));
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

(async function startServer() {
    try {
        await initializeDB();

        if (__filename.includes("dist")) {
            const port = app.get("port");
            app.listen(port, () => 
                console.log("Server listening on port " + port)
            );
        }
    } catch (err) {
        console.log(err);
    }
})();
