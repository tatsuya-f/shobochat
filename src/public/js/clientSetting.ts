import { SettingHTTPHandler } from "./HTTPHandler";
import { SettingStateManager } from "./StateManager";

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
