import { SettingHTTPHandler } from "./HTTPHandler";
import { SettingStateManager } from "./StateManager";

const queryMessageDuration = 3000;

async function changeUsername(stateManager: SettingStateManager) {
    const username = $("#username").val();
    const $queryMessage = $("#setting-status-message");
    if (typeof username === "string") {
        try {
            const state = await stateManager.httpHandler.putUsername(username);
            if (state === 200) {
                $queryMessage
                    .css("color", "black")
                    .html("ユーザー名を変更しました")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            } else {
                $queryMessage
                    .css("color", "red")
                    .html("ユーザー名を変更できませんでした")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            }
        } catch (err) {
            console.log(err);
        }
    }
}

async function changeUserpass(stateManager: SettingStateManager) {
    const userpass = $("#userpass").val();
    const userpassVerify = $("#userpass-verify").val();
    const $queryMessage = $("#setting-status-message");
    if (userpass !== userpassVerify) {
        $queryMessage
            .css("color", "red")
            .html("あいことばが一致しません")
            .fadeIn("fast")
            .delay(queryMessageDuration)
            .fadeOut("fast");
    } else if (typeof userpass === "string") {
        try {
            const status = await stateManager.httpHandler.putUserpass(userpass);
            if (status === 200) {
                $queryMessage
                    .css("color", "black")
                    .html("あいことばを変更しました")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            } else {
                $queryMessage
                    .css("color", "red")
                    .html("あいことばを変更できませんでした")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            }
        } catch (err) {
            console.log(err);
        }
    }
}

async function addChannel(stateManager: SettingStateManager) {
    const newChannel = $("#new-channel-name").val();
    const $queryMessage = $("#setting-status-message");
    if (typeof newChannel === "string") {
        try {
            const state = await stateManager.httpHandler.postChannel(newChannel);
            if (state === 200) {
                $queryMessage
                    .css("color", "black")
                    .html("チャンネルを追加しました")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            } else {
                $queryMessage
                    .css("color", "red")
                    .html("チャンネルの追加ができませんでした")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            }
        } catch (err) {
            console.log(err);
        }
    }
}

async function delChannel(stateManager: SettingStateManager) {
    const channel = $("#del-channel-name").val();
    const channelVerify = $("#del-channel-name-verify").val();
    const $queryMessage = $("#setting-status-message");
    if (channel !== channelVerify) {
        $queryMessage
            .css("color", "red")
            .html("チャンネルの名前が一致しません")
            .fadeIn("fast")
            .delay(queryMessageDuration)
            .fadeOut("fast");
    } else if (typeof channel === "string") {
        try {
            const status = await stateManager.httpHandler.deleteChannel(channel);
            if (status === 200) {
                $queryMessage
                    .css("color", "black")
                    .html("チャンネルを削除しました")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            } else {
                $queryMessage
                    .css("color", "red")
                    .html("チャンネルを削除することができませんでした")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            }
        } catch (err) {
            console.log(err);
        }
    }
}

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
    $("#channel-del-menu").on("click", () => {
        stateManager.channelDel();
    });
    $("#apply-setting").on("click", async () => {
        $("#apply-setting").addClass("is-loading");
        // await stateManager.apply();
        switch (stateManager.state) {
            case "username": {
                await changeUsername(stateManager);
                break;
            }
            case "userpass": {
                await changeUserpass(stateManager);
                break;
            }
            case "channel-add": {
                await addChannel(stateManager);
                break;
            }
            case "channel-del": {
                await delChannel(stateManager);
                break;
            }
        }
        $("#apply-setting").removeClass("is-loading");
    });
});
