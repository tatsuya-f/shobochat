// import { UserClient } from "../../common/UserClient";
import { SettingHTTPHandler } from "./HTTPHandler";
import { SettingStateManager } from "./StateManager";

// async function update(chatApiEndpoint: string): Promise<void> {
//     const name = $("#name").val();
//     const password = $("#pass").val();
//     const passwordVerify = $("#pass-verify").val();
//     if (password !== passwordVerify) {  // reject
//         alert("あいことばがいっちしません。");
//         console.log("not correspond passwordVerify to password");
//         return;
//     }
//     if (typeof name !== "string" || typeof password !== "string") { // reject
//         alert("なまえとあいことばはもじでいれてください。");
//         return;
//     }
//     const user = new UserClient(name, password);
//     try {
//         const status = await user.put(chatApiEndpoint);
//         if (status === 200) {
//             console.log("Success");
//             window.location.href = "/chat";
//         } else {
//             alert("へんこうできませんでした。");
//             console.log("POST Failed");
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }

$(() => {
    const httpHandler = new SettingHTTPHandler();
    const stateManager = new SettingStateManager(httpHandler);
    $("#username-menu").on("click", () => {
        stateManager.username();
    });
    $("#userpass-menu").on("click", () => {
        stateManager.userpass();
    });
    $("#channel-add-menu").on("click", () => {
        stateManager.channelAdd();
    });
    $("#apply-setting").on("click", async () => {
        $("#setting").addClass("is-loading");
        await stateManager.apply();
        $("#setting").removeClass("is-loading");
    });
});
