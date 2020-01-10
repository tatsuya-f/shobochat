import { HTTPHandler } from "./HTTPHandler";
import { isNotification, NotifyKind } from "../../common/Notification";
import { Message } from "../../common/Message";
import { Channel, isChannelArray } from "../../common/Channel";
import { MessageManager } from "./MessageManager";
import { StateManager } from "./StateManager";
import { hasChar, parseMarkdown } from "./utils";

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

export function setChannelList(channels: Array<Channel>) {
    const $channelList = $("#channel-list");
    $channelList.empty();
    for (const channel of channels) {
        $channelList.append(`<a class="shobo-channel navbar-item">${channel.name}</a>`);
    }
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


$(() => {
    const websocketEndPoint = "ws://localhost:8080";
    let ws = new WebSocket(websocketEndPoint);
    let httpHandler = new HTTPHandler();
    const messageManager = new MessageManager(httpHandler);
    const stateManager = new StateManager(httpHandler);

    ws.addEventListener("open", () => { // 接続完了後発火
        ws.send("");
    });
    ws.addEventListener("message", async (e) => { // サーバーがsendすると発火
        const notify = JSON.parse(e.data);
        if (!isNotification(notify)) { return; }
        switch (notify.kind) {
            // Message notify
            case NotifyKind.Init: {
                if (isChannelArray(notify.payload.channels)) {
                    setChannelList(notify.payload.channels);
                }
                await messageManager.initialize();
                break;
            }
            case NotifyKind.MsgNew: {
                const channel = notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== messageManager.channel) { break; }

                await messageManager.getNew();
                break;
            }
            case NotifyKind.MsgChanged: {
                const channel = notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== messageManager.channel) { break; }

                if (typeof notify.payload.messageId === "string") {
                    await messageManager.fetch(notify.payload.messageId);
                }
                break;
            }
            case NotifyKind.MsgDeleted: {
                const channel = notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== messageManager.channel) { break; }

                if (typeof notify.payload.messageId === "string") {
                    await messageManager.onDeleteEvent(notify.payload.messageId);
                }
                break;
            }
            // User notify
            case NotifyKind.UserChanged: {
                if (typeof notify.payload["newName"] === "string" &&
                   typeof notify.payload["oldName"] === "string") {
                    messageManager.onChangeUserNameEvent(
                        notify.payload["newName"],
                        notify.payload["oldName"]
                    );
                }
                break;
            }
            // Channel notify
        }
    });

    //<left click menu>
    $("#contextmenu").hide();
    $(document).on("contextmenu", ".shobo-message-div", function(e) {
        $("#contextmenu").data("message-id", $(this).data("message-id"));
        $("#contextmenu").show();
        $("#contextmenu").offset({
            top: e.pageY,
            left: e.pageX
        });
        return false;
    });
    $("body").on("click", () => {
        $("#contextmenu").hide();
    });
    $("#delete-msg").on("click", async function() {
        let messageId = $("#contextmenu").data("message-id");
        if (typeof messageId === "string") {
            await messageManager.delete(messageId);
        }
    });
    $("#edit-msg").on("click", async function() {
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
        console.log($(this).text());
        messageManager.setChannel($(this).text());
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
        await messageManager.send();
        $("#send").removeClass("is-loading");
    });
    $("#edited").on("click", async () => {
        $("#send").addClass("is-loading");
        await messageManager.update();
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

