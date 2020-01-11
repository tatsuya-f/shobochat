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
        switch (this.state) {
            // about user
            case "username": {
                const username = $("#username").val();
                if (typeof username === "string") {
                    this.httpHandler.putUsername(username);
                }
                break;
            }
            case "userpass": {
                const userpass = $("#userpass").val();
                const userpassVerify = $("#userpass-verify").val();
                if (userpass !== userpassVerify) {
                    alert("あいことばがいっちしません。");
                } else if (typeof userpass === "string") {
                    try {
                        const status = await this.httpHandler.putUserpass(userpass);
                        if (status === 200) {
                            console.log("Success");
                            // window.location.href = "/chat";
                        } else {
                            alert("へんこうできませんでした。");
                            console.log("POST Failed");
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
                if (typeof newChannel === "string") {
                    this.httpHandler.postChannel(newChannel);
                }
                break;
            }
        }
    }
}
