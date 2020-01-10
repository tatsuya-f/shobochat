import { HTTPHandler } from "./HTTPHandler";
import { isNotification, NotifyKind } from "../../common/Notification";
import { Message, isMessageArray } from "../../common/Message";
import { Channel, isChannelArray } from "../../common/Channel";
import { hasChar, escapeHTML, changeTimeFormat } from "./utils";
import * as MarkdownIt from "markdown-it";
import { highlight } from "highlight.js";
import * as sanitizeHtml from "sanitize-html";
//@ts-ignore
import * as fa from "markdown-it-fontawesome";  // There are no type definition files

const markdownit = new MarkdownIt({
    highlight: (code, lang) => {
        if (typeof lang === "string") {
            try {
                return highlight(lang, code).value;
            }
            catch (err) {
                console.log(err);
                return code;
            }
        } else {
            return code;
        }
    },
    breaks: true,
    linkify: true,
    html: true
}).use(fa);

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

export function parseMarkdown(md: string): string {
    return sanitizeHtml(markdownit.render(md), {
        allowedTags: [
            "h1", "h2", "h3", "h4", "h5",
            "b", "i", "strong", "em", "strike", "del", "blockquote", "s",
            "pre", "p", "div", "code", "span",
            "tr", "th", "td", "ol", "li", "ul", "table", "thead", "tbody",
            "br",
            "a", "img", "details", "summary"],
        allowedAttributes: {
            "a": ["href"],
            "i": ["class"],
            "span": ["style", "class"],
            "code": ["class"],
        },
    });
}

export class MessageHandler {
    private _messages: Array<Message>
    private time: number;  // last updated time
    private httpHandler: HTTPHandler;
    constructor(httpHandler: HTTPHandler) {
        this.httpHandler = httpHandler;
        this._messages = [];
        this.time = Date.now();
    }
    showAll() {
        const $messageList = $("#messageList");
        $messageList.empty();
        this._messages.forEach((message) => {
            const time = new Date(message.time);
            const displayTime = changeTimeFormat(time);
            const messageTag = `\
                <div class="shobo-message-div" data-message-id=${message.id}> \
                    <span style="font-size: 40px;"> \
                        <i class="fas fa-user-circle"></i> \
                    </span>
                    <span class="shobo-name"> \
                        ${escapeHTML(message.name)} \
                    </span> \
                    <span class="shobo-time"> \
                        ${displayTime} \
                    </span> \
                    <div class="content shobo-message"> \
                        ${parseMarkdown(message.content)} \
                    </div> \
                </div>`;
            $messageList.prepend(messageTag);
        });
    }
    async getNew() {
        const messages = await this.httpHandler.getNewer(this.time);
        this._messages.unshift(...messages);
        this.updateTime();
        this.showAll();
        $("#shobo-main").scrollTop($("#shobo-main")[0].scrollHeight);
    }
    updateTime() {
        if (this._messages.length === 0) {
            this.time = Date.now();
        } else {
            this.time = this._messages[0].time || Date.now();
        }
    }
    async fetch(messageId: string) {
        const message = await this.httpHandler.get(messageId);
        for (let m of this._messages) {
            if (m.id === messageId) {
                m.content = message.content;
            }
        }
        this.showAll();
    }
    async getOld() {
        const messages = await this.httpHandler.getOlder(
            this._messages[this._messages.length - 1].time, 5);
        this._messages.push(...messages);
        const $shobomain = $("#shobo-main")[0];
        const oldScrollHeight = $shobomain.scrollHeight;
        this.showAll();
        // keep current position
        $("#shobo-main").scrollTop($shobomain.scrollHeight - oldScrollHeight);
    }
    delete(messageId: string) {
        this._messages = this._messages.filter(m => m.id !== messageId);
        // keep current position
        const oldScrollTop = $("#shobo-main")[0].scrollTop;
        this.showAll();
        $("#shobo-main").scrollTop(oldScrollTop);
    }
    set messages(messages: Array<Message>) {
        this._messages = messages;
        this.updateTime();
        this.showAll();
        // goto bottom
        $("#shobo-main").scrollTop($("#shobo-main")[0].scrollHeight);
    }
    changeUserName(oldName: string, newName: string) {
        for (let m of this._messages) {
            if (m.name === oldName) {
                m.name = newName;
            }
        }
    }
}

const queryMessageDuration = 3000;
export async function sendMessage(httpHandler: HTTPHandler) {
    const message = $("#message").val();

    if (typeof message === "string" && message !== "") {
        try {
            const status = await httpHandler.post(message);
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
        } catch (err) {
            console.log(err);
        }
    }
    $("#message").val("");
}

export async function updateMessage(httpHandler: HTTPHandler) {
    const message = $("#message").val();
    const messageId = $("#input-area").data("message-id");
    if (typeof message === "string" && message !== "") {
        try {
            const status = await httpHandler.put(messageId, message);
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
                console.log("POST Failed");
            }
            $("#send").prop("disabled", true);
        } catch (err) {
            console.log(err);
        }
    }
    $("#message").val("");
}

export async function removeMessage(httpHandler: HTTPHandler, messageId: string): Promise<void> {
    const status = await httpHandler.delete(messageId);
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
        console.log("DELETE Failed");
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

const StateList = ["normal", "edit", "hidden"] as const;
type State = typeof StateList[number];
class StateManager {
    private _state: State = "normal"
    private httpHandler: HTTPHandler;
    constructor(httpHandler: HTTPHandler) {
        this.httpHandler = httpHandler;
        this.normal();
    }
    set state(state: State) {
        this._state = state;
        for (const state of StateList) {
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

$(() => {
    const websocketEndPoint = "ws://localhost:8080";
    let ws = new WebSocket(websocketEndPoint);
    let httpHandler = new HTTPHandler();
    const messageHandler = new MessageHandler(httpHandler);
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
                if (isMessageArray(notify.payload.messages)) {
                    messageHandler.messages = notify.payload.messages;
                }
                break;
            }
            case NotifyKind.MsgNew: {
                const channel = notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== httpHandler.channel) { break; }

                await messageHandler.getNew();
                break;
            }
            case NotifyKind.MsgChanged: {
                const channel = notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== httpHandler.channel) { break; }

                if (typeof notify.payload.messageId === "string") {
                    await messageHandler.fetch(notify.payload.messageId);
                }
                break;
            }
            case NotifyKind.MsgDeleted: {
                const channel = notify.payload.channel;
                if (typeof channel !== "string") { break; }
                if (channel !== httpHandler.channel) { break; }

                if (typeof notify.payload.messageId === "string") {
                    await messageHandler.delete(notify.payload.messageId);
                }
                break;
            }
            // User notify
            case NotifyKind.UserChanged: {
                if (typeof notify.payload["newName"] === "string" &&
                   typeof notify.payload["oldName"] === "string") {
                    messageHandler.changeUserName(
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
            await removeMessage(httpHandler, messageId);
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
        httpHandler.channel = $(this).text();
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
        await sendMessage(httpHandler);
        $("#send").removeClass("is-loading");
    });
    $("#edited").on("click", async () => {
        $("#send").addClass("is-loading");
        await updateMessage(httpHandler);
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
                await messageHandler.getOld();
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
                await messageHandler.getOld();
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

