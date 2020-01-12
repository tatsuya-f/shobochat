import * as express from "express";
import * as session from "express-session";
import { checkLogin } from "./handler/loginHandler";
import { indexRouter } from "./route/index";
import { loginRouter } from "./route/login";
import { registerRouter } from "./route/register";
import { settingRoute } from "./route/setting";
import { chatRouter } from "./route/chat";
import { messagesRouter } from "./route/messages";
import { channelsRouter } from "./route/channels";
import { DatabaseManager } from "./database/DatabaseManager";
import { UserRepository } from "./database/repository/UserRepository";
import { ChannelRepository } from "./database/repository/ChannelRepository";
import { defaultChannelList } from "../common/Channel";
import { NotificationManager } from "./notification/NotificationManager";

export const app = express();
export let shobot: number;

app.set("port", parseInt(process.env.EXPRESS_PORT || "8000"));

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

app.use("/channels", checkLogin, channelsRouter);

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

            await NotificationManager.initialize();

            const port = app.get("port"); // テスト時にはテスト側でportをlistenする
            app.listen(port, () =>
                console.log("Server listening on port " + port)
            );
        }
    } catch (err) {
        console.log(err);
    }
})();
