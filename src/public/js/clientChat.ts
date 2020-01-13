import { MessagesHTTPHandler } from "./HTTPHandler";
import { isNotification } from "../../common/Notification";
import { Message } from "../../common/Message";
import { Channel, defaultChannel } from "../../common/Channel";
import { MessageManager } from "./MessageManager";
import { ChatStateManager } from "./StateManager";
import { hasChar, parseMarkdown } from "./utils";
import { Observer } from "./observer/Observer";
import { ObserverManager } from "./ObserverManager";

export function isValidMessage(message: Message): boolean {
    let isValid = true;
    if (!hasChar(message.name)) {
        isValid = false;
        $("#name").addClass("is-danger");
    }
    else {
        $("#name").removeClass("is-danger");
    }
    if (!hasChar(message.content)) {
        isValid = false;
        $("#message").addClass("is-danger");
    }
    else {
        $("#message").removeClass("is-danger");
    }
    return isValid;
}

export async function checkInput(): Promise<void> {
    const message = $("#message").val();
    if (typeof message !== "string" || message === "") {
        $("#send").prop("disabled", true);
        $("#edited").prop("disabled", true);
    } else {
        $("#send").prop("disabled", false);
        $("#edited").prop("disabled", false);
    }
}

function insertTextarea(before: string, after: string) {
    const $textarea = $("#message");
    const text = $textarea.val();
    if (typeof text !== "string") { return; }
    const startpos = $textarea.prop("selectionStart");
    const endpos = $textarea.prop("selectionEnd");
    const beforeCursor = text.substr(0, startpos) + before;
    const selected = text.substr(startpos, endpos - startpos);
    const afterCursor = after + text.substr(endpos, text.length);
    $textarea.val(beforeCursor + selected + afterCursor);
    $textarea.focus();
    $textarea.prop({
        "selectionStart": beforeCursor.length,
        "selectionEnd": beforeCursor.length
    });
    checkInput();
}

export class ChannelManager {
    private _channels: Set<string> = new Set();
    private _current = defaultChannel;
    set current(channel: string) {
        this._current = channel;
        $(".shobo-channel").removeClass("is-active");
        $(`#channel-${this._current}`).addClass("is-active");
    }
    get current(): string {
        return this._current;
    }
    set channels(channels: Array<Channel>) {
        for (const channel of channels) {
            this._channels.add(channel.name);
        }
        this.show();
    }
    add(channel: string) {
        this._channels.add(channel);
        this.show();
    }
    del(deletedChannel: string) {
        this._channels.delete(deletedChannel);
        this.show();
    }
    show() {
        const $channelList = $("#channel-list");
        $channelList.children(".shobo-channel").remove();
        Array.from(this._channels.values()).sort().forEach(channel => {
            $channelList.prepend(`<a id="channel-${channel}" class="shobo-channel navbar-item">${channel}</a>`);
        });
        $(`#channel-${this.current}`).addClass("is-active");
    }
}

const queryMessageDuration = 3000;

async function requestDelete(messageManager: MessageManager) {
    const messageId = $("#contextmenu").data("message-id");
    if (typeof messageId === "string") {
        try {
            const status = await messageManager.delete(messageId);
            const $queryMessage = $("#queryMessage");
            if (status === 200) {
                $queryMessage
                    .css("color", "black")
                    .html("メッセージを削除しました")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            } else {
                $queryMessage
                    .css("color", "red")
                    .html("メッセージを削除できませんでした")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            }
        } catch (err) {
            console.log(err);
        }
    }
}

async function requestSend(messageManager: MessageManager) {
    const content = $("#message").val();
    try {
        if (typeof content === "string" && content !== "") {
            const status = await messageManager.send(content);
            const $queryMessage = $("#queryMessage");
            if (status === 200) {
                $queryMessage
                    .css("color", "black")
                    .html("メッセージを送信しました")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
                $("#shobo-main").animate({
                    scrollTop: $("#shobo-main")[0].scrollHeight
                });
                $("#message").val("");
            } else {
                $queryMessage
                    .css("color", "red")
                    .html("メッセージを送信できませんでした")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
                console.log("POST Failed");
            }
            $("#send").prop("disabled", true);
        }
    } catch (err) {
        console.log(err);
    }
}

async function requestChange(messageManager: MessageManager) {
    const messageId = $("#input-area").data("message-id");
    const content = $("#message").val();
    if (typeof content === "string" &&
        typeof messageId === "string" &&
        content !== "") {
        try {
            const status = await messageManager.update(messageId, content);
            const $queryMessage = $("#queryMessage");
            if (status === 200) {
                $queryMessage
                    .css("color", "black")
                    .html("メッセージを更新しました")
                    .fadeIn("fast")
                    .delay(queryMessageDuration)
                    .fadeOut("fast");
            } else {
                $queryMessage
                    .css("color", "red")
                    .html("メッセージを更新できませんでした")
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
    const websocketEndPoint = "ws://localhost:8080";
    const ws = new WebSocket(websocketEndPoint);
    const httpHandler = new MessagesHTTPHandler();
    const messageManager = new MessageManager(httpHandler);
    const stateManager = new ChatStateManager(httpHandler);
    const channelManager = new ChannelManager();

    ws.addEventListener("open", () => { // 接続完了後発火
        ws.send("");
    });
    ws.addEventListener("message", async (e) => { // サーバーがsendすると発火
        const notify = JSON.parse(e.data);
        if (!isNotification(notify)) { return; }

        const observer: Observer|undefined = ObserverManager.getObserver(notify, messageManager, channelManager);
        if (!observer) {
            console.log("invalid NotifyKind");
        } else {
            await observer.update();
        }
    });

    //<left click menu>
    $("#contextmenu").hide();
    $("body").on("click", () => {
        $("#contextmenu").hide();
    });

    $(document).on("contextmenu", ".shobo-message-div", function(e) {
        $("#contextmenu").data("message-id", $(this).data("message-id"));
        $("#contextmenu").show();
        $("#contextmenu").offset({
            top: e.pageY,
            left: e.pageX
        });
        return false;
    });
    $("#delete-msg-btn").on("click", async () => {
        requestDelete(messageManager);
    });
    $("#edit-msg-btn").on("click", async () => {
        const messageId = $("#contextmenu").data("message-id");
        await stateManager.edit(messageId);
    });
    //</left click menu>

    //<navigation>
    $(".navbar-burger").on("click", () => {
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
    $("#help-open").on("click", () => {
        $("#help-popup").addClass("is-active");

        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
    $("#help-close").on("click", () => {
        $("#help-popup").removeClass("is-active");
    });
    $("#setting").on("click", () => {
        window.location.href = "/setting";
    });
    $(document).on("click", ".shobo-channel", function () {
        channelManager.current = $(this).text();
        messageManager.setChannel($(this).text());
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
    //</navigation>

    //<input area>
    $("#markdown-preview-open").on("click", () => {
        const message = $("#message").val();
        if (typeof message === "string") {
            $("#markdown-preview-body").html(parseMarkdown(message));
            $("#markdown-preview").addClass("is-active");
        }
    });
    $("#markdown-preview-close").on("click", () => {
        $("#markdown-preview").removeClass("is-active");
    });

    $("#bold-btn").on("click", () => {
        insertTextarea("**", "**");
    });
    $("#italic-btn").on("click", () => {
        insertTextarea("*", "*");
    });
    $("#strike-btn").on("click", () => {
        insertTextarea("~~", "~~");
    });
    $("#code-btn").on("click", () => {
        insertTextarea("```", "\n```");
    });
    $("#link-btn").on("click", () => {
        insertTextarea("[", "](https://)");
    });

    $("#send").on("click", async () => {
        $("#send").addClass("is-loading");
        requestSend(messageManager);
        $("#send").removeClass("is-loading");
    });
    $("#edited").on("click", async () => {
        $("#send").addClass("is-loading");
        await requestChange(messageManager);
        $("#send").removeClass("is-loading");
        $("#input-area").data("message-id", null);
        stateManager.normal();
    });
    $("#message").on("keyup", () => {
        checkInput();
    });
    $("#input-area-show").on("click", () => {
        stateManager.normal();
    });
    $("#input-area-hide").on("click", () => {
        stateManager.hidden();
    });
    $("#edit-cancel").on("click", () => {
        stateManager.normal();
    });
    //</input area>

    //<message list>
    async function fetchKeydownEventListener(e: JQueryEventObject) {
        if (e.which === 38) {
            if ($("#shobo-main")[0].scrollTop === 0) { // now top of shobo-main
                $("#shobo-main").off("mousewheel");
                $(document).off("keydown");
                await messageManager.getOld();
                $("#shobo-main").on("mousewheel", fetchScrollEventListener);
                $(document).on("keydown", fetchKeydownEventListener);
            }
        }
    }
    async function fetchScrollEventListener(e: JQueryMousewheel.JQueryMousewheelEventObject) {
        if (e.deltaY >= 1) {
            if ($("#shobo-main")[0].scrollTop === 0) { // now top of shobo-main
                $("#shobo-main").off("mousewheel");
                $(document).off("keydown");
                await messageManager.getOld();
                $("#shobo-main").on("mousewheel", fetchScrollEventListener);
                $(document).on("keydown", fetchKeydownEventListener);
            }
        }
    }
    $("#shobo-main").on("mousewheel", fetchScrollEventListener);
    $(document).on("keydown", fetchKeydownEventListener);
    //</message list>

    //<message highlight>
    $(document).on("mouseover", ".shobo-message-div", function()  {
        $(this).addClass("has-background-grey-light");
    }).on("mouseout", ".shobo-message-div", function() {
        $(this).removeClass("has-background-grey-light");
    });
    //</message highlight>
});

