import * as express from "express";
import * as session from "express-session";
import * as WebSocket from "ws";
import { broadcastMessages } from "./webSocketHandler";
import { initializeDB, insertUser } from "./dbHandler";
import { checkLogin } from "./loginHandler";
import { indexRouter } from "./route/index";
import { loginRouter } from "./route/login";
import { registerRouter } from "./route/register";
import { chatRouter } from "./route/chat";
import { messagesRouter } from "./route/messages";

export const app = express();
export const wss = new WebSocket.Server({ port: 8080 });

app.set("port", 8000);

app.use(express.json());

app.use(session({
    secret: "shoboshobo",
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 365 // 1 year
    }
})); // 各エンドポイントにアクセスされる際に，付与していない場合は session 用の Cookie をブラウザに付与

app.use("/", indexRouter);
app.use(express.static("public")); // GET / された後に静的ファイルを配信

app.use("/login", loginRouter);

app.use("/register", registerRouter);

app.use("/chat", checkLogin, chatRouter);

app.use("/messages", checkLogin, messagesRouter);

wss.on("connection", (ws) => {
    // 接続完了後Client側でsendするとServerのmessage eventが発火
    ws.on("message", async () => {
        console.log("WebSocket connected");
        try {
            await broadcastMessages();
        } catch (err) {
            console.log(err);
        }
    });
});

export let shobot: number;

(async function startServer() {
    try {
        await initializeDB();
        shobot = await insertUser("しょぼっと", "shobot");
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
