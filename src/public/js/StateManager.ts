import { MessagesHTTPHandler, SettingHTTPHandler } from "./HTTPHandler";

const ChatStateList = ["normal", "edit", "hidden"] as const;
type ChatState = typeof ChatStateList[number];
export class ChatStateManager {
    private _state: ChatState = "normal";
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
        document.documentElement.style.setProperty("--input-area-height", `${$("#input-area").outerHeight()}px`);
        $("#message").val("");
    }
    async edit(messageId: string, content: string) {
        this.state = "edit";
        document.documentElement.style.setProperty("--input-area-height", `${$("#input-area").outerHeight()}px`);
        try {
            $("#message").val();
            $("#message").val(content);
            $("#input-area").data("message-id", messageId);
        } catch (err) {
            console.log(err);
        }
    }
    hidden() {
        this.state = "hidden";
        document.documentElement.style.setProperty("--input-area-height", `${$("#input-area").outerHeight()}px`);
    }
}

const SettingStateList = [
    // about user
    "username",
    "userpass",
    // about channel
    "channel-add",
    "channel-del"
] as const;
type SettingState = typeof SettingStateList[number];
export class SettingStateManager {
    private _state: SettingState = "username";
    httpHandler: SettingHTTPHandler;
    constructor(httpHandler: SettingHTTPHandler) {
        this.httpHandler = httpHandler;
        this.state = "username";
        for (const state of SettingStateList) {
            if (state !== this.state) {
                $(`.shobo-${state}-setting-mode`).hide();
            }
        }
        $(`#${this.state}-menu`).addClass("is-active");
    }
    set state(state: SettingState) {
        $("input").val("");
        $(`.shobo-${this.state}-setting-mode`).hide();
        $(`#${this.state}-menu`).removeClass("is-active");
        this._state = state;
        $(`#${this.state}-menu`).addClass("is-active");
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
    channelDel() {
        this.state = "channel-del";
    }
}
