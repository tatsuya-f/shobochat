import {
    httpHandler,
    sendMessage,
    updateMessage,
    removeMessage,
    checkInput,
    parseMarkdown,
    MessageHandler
} from "./messageHandler";
import  { isNotification, NotifyKind } from "./Notification";
import { isMessageArray } from "./Message";

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
}

function normalMode() {
    $(".shobo-hidden-mode").hide();
    $(".shobo-edit-mode").hide();
    $(".shobo-normal-mode").show();
    document.documentElement.style.setProperty(
        "--input-area-height", `${$("#input-area").outerHeight()}px`
    );
    $("#message").val("");
}

async function editMode(messageId: string) {
    $(".shobo-normal-mode").hide();
    $(".shobo-hidden-mode").hide();
    $(".shobo-edit-mode").show();
    document.documentElement.style.setProperty(
        "--input-area-height", `${$("#input-area").outerHeight()}px`
    );
    try {
        $("#message").val();
        const msg = await httpHandler.get(messageId);
        $("#message").val(msg.content);
        $("#input-area").data("message-id", messageId);
    } catch (err) {
        console.log(err);
    }
}

function hiddenMode() {
    $(".shobo-normal-mode").hide();
    $(".shobo-edit-mode").hide();
    $(".shobo-hidden-mode").show();
    document.documentElement.style.setProperty(
        "--input-area-height", `${$("#input-area").outerHeight()}px`
    );
}

$(() => {
    const websocketEndPoint = "ws://localhost:8080";
    let ws = new WebSocket(websocketEndPoint);
    let messageHandler = new MessageHandler();

    ws.addEventListener("open", () => { // 接続完了後発火
        ws.send("");
    });
    ws.addEventListener("message", async (e) => { // サーバーがsendすると発火
        const notify = JSON.parse(e.data);
        if (!isNotification(notify)) { return; }
        switch (notify.kind) {
            case NotifyKind.Init: {
                if (isMessageArray(notify.payload)) {
                    messageHandler.messages = notify.payload;
                }
                break;
            }
            case NotifyKind.New: {
                await messageHandler.getNew();
                break;
            }
            case NotifyKind.Changed: {
                if (typeof notify.payload === "string") { // messageId
                    await messageHandler.fetch(notify.payload);
                }
                break;
            }
            case NotifyKind.Deleted: {
                if (typeof notify.payload === "string") { // messageId
                    await messageHandler.delete(notify.payload);
                }
            }
        }
    });

    // default mode
    normalMode();

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
            await removeMessage(messageId);
        }
    });
    $("#edit-msg").on("click", async function() {
        const messageId = $("#contextmenu").data("message-id");
        await editMode(messageId);
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
    $("help-popup").on("focusout", () => {
        $("#help-popup").removeClass("is-active");
    });
    $("#help-close").on("click", () => {
        $("#help-popup").removeClass("is-active");
    });
    $("#setting").on("click", () => {
        window.location.href = "/setting";
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

    $("#send").on("click", async () => {
        $("#send").addClass("is-loading");
        await sendMessage();
        $("#send").removeClass("is-loading");
    });
    $("#edited").on("click", async () => {
        $("#send").addClass("is-loading");
        await updateMessage();
        $("#send").removeClass("is-loading");
        $("#input-area").data("message-id", null);
        normalMode();
    });
    $("#message").on("input", () => {
        checkInput();
    });
    $("#input-area-show").on("click", () => {
        normalMode();
    });
    $("#input-area-hide").on("click", () => {
        hiddenMode();
    });
    $("#edit-cancel").on("click", () => {
        normalMode();
    });
    //</input area>

    //<message list>
    async function fetchKeydownEventListener(e: JQueryEventObject) {
        console.log(e.which);
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

