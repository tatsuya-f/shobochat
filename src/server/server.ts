import * as express from "express";
import * as session from "express-session";
import * as WebSocket from "ws";
import { initMessages } from "./handler/webSocketHandler";
import { checkLogin } from "./handler/loginHandler";
import { indexRouter } from "./route/index";
import { loginRouter } from "./route/login";
import { registerRouter } from "./route/register";
import { settingRoute } from "./route/setting";
import { chatRouter } from "./route/chat";
import { messagesRouter } from "./route/messages";
import { DatabaseManager } from "./database/DatabaseManager";
import { UserRepository } from "./repository/UserRepository";
import { ChannelRepository } from "./repository/ChannelRepository";
import { defaultChannelList } from "../common/Channel";

export const app = express();
export const wss = new WebSocket.Server({ port: 8080 });
export let shobot: number;

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
app.use(express.static("../public")); // GET / された後に静的ファイルを配信

app.use("/login", loginRouter);

app.use("/register", registerRouter);

app.use("/setting", checkLogin, settingRoute);

app.use("/chat", checkLogin, chatRouter);

app.use("/messages", checkLogin, messagesRouter);

wss.on("connection", (ws) => {
    // 接続完了後Client側でsendするとServerのmessage eventが発火
    ws.on("message", async () => {
        console.log("WebSocket connected");
        try {
            await initMessages();
        } catch (err) {
            console.log(err);
        }
    });
});

(async function startServer() {
    try {
        if (__filename.endsWith("/dist/server/server.ts")) { // 以下はテスト時には実行されない
            const databaseManager: DatabaseManager = await DatabaseManager.getInstance();
            const userRepository: UserRepository = databaseManager.getRepository(UserRepository);
            const channelRepository: ChannelRepository = databaseManager.getRepository(ChannelRepository);

            const shobotName = "しょぼっと";
            if (!await userRepository.hasName(shobotName)) {
                shobot = await userRepository
                    .insertAndGetId(shobotName, "shobot");
            } else {
                shobot = (await userRepository.getByName(shobotName)).id;
            }
            for (const channel of defaultChannelList) {
                if (!await channelRepository.hasName(channel)) {
                    await channelRepository.insertAndGetId(channel);
                }
            }

            const port = app.get("port"); // テスト時にはテスト側でportをlistenする
            app.listen(port, () =>
                console.log("Server listening on port " + port)
            );
        }
    } catch (err) {
        console.log(err);
    }
})();
