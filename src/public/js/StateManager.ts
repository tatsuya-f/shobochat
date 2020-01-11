import { MessagesHTTPHandler, SettingHTTPHandler } from "./HTTPHandler";

const ChatStateList = ["normal", "edit", "hidden"] as const;
type ChatState = typeof ChatStateList[number];
export class ChatStateManager {
    private _state: ChatState = "normal"
    private httpHandler: MessagesHTTPHandler;
    constructor(httpHandler: MessagesHTTPHandler) {
        this.httpHandler = httpHandler;
        this.normal();
    }
    set state(state: ChatState) {
        this._state = state;
        for (const state of ChatStateList) {
            if (state !== this._state) {
                $(`.shobo-${state}-mode`).hide();
            }
        }
        $(`.shobo-${this.state}-mode`).show();
    }
    get state() {
        return this._state;
    }
    normal() {
        this.state = "normal";
        document.documentElement.style.setProperty(
            "--input-area-height", `${$("#input-area").outerHeight()}px`
        );
        $("#message").val("");
    }
    async edit(messageId: string) {
        this.state = "edit";
        document.documentElement.style.setProperty(
            "--input-area-height", `${$("#input-area").outerHeight()}px`
        );
        try {
            $("#message").val();
            const msg = await this.httpHandler.get(messageId);
            $("#message").val(msg.content);
            $("#input-area").data("message-id", messageId);
        } catch (err) {
            console.log(err);
        }
    }
    hidden() {
        this.state = "hidden";
        document.documentElement.style.setProperty(
            "--input-area-height", `${$("#input-area").outerHeight()}px`
        );
    }
}

const SettingStateList = [
    // about user
    "username", "userpass",
    // about channel
    "channel-add"] as const;
type SettingState = typeof SettingStateList[number];
export class SettingStateManager {
    private _state: SettingState = "username"
    private httpHandler: SettingHTTPHandler;
    constructor(httpHandler: SettingHTTPHandler) {
        this.httpHandler = httpHandler;
        this.state = "username";
    }
    set state(state: SettingState) {
        this._state = state;
        for (const state of SettingStateList) {
            if (state !== this._state) {
                $(`.shobo-${state}-setting-mode`).hide();
            }
        }
        $(`.shobo-${this.state}-setting-mode`).show();
    }
    get state() {
        return this._state;
    }

    username() {
        this.state = "username";
    }
    userpass() {
        this.state = "userpass";
    }
    channelAdd() {
        this.state = "channel-add";
    }
    async apply() {
        const queryMessageDuration = 3000;
        switch (this.state) {
            // about user
            case "username": {
                const username = $("#username").val();
                const $queryMessage = $("#setting-status-message");
                if (typeof username === "string") {
                    try {
                        const state = await this.httpHandler.putUsername(username);
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
                break;
            }
            case "userpass": {
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
                        const status = await this.httpHandler.putUserpass(userpass);
                        if (status === 200) {
                            $queryMessage
                                .css("color", "red")
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
                break;
            }
            // about channel
            case "channel-add": {
                const newChannel = $("#new-channel-name").val();
                const $queryMessage = $("#setting-status-message");
                if (typeof newChannel === "string") {
                    try {
                        const state = await this.httpHandler.postChannel(newChannel);
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
                break;
            }
        }
    }
}
