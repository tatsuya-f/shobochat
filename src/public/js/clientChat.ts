import {
    sendMessage,
    getMessage,
    updateMessage,
    showMessages,
    removeMessage,
    checkInput,
    parseMarkdown
} from "./messageHandler";
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
    console.log("start", startpos);
    console.log("end", endpos);
    console.log(selected);
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
}

async function editMode(chatApiEndpoint: string, messageId: string) {
    $(".shobo-normal-mode").hide();
    $(".shobo-hidden-mode").hide();
    $(".shobo-edit-mode").show();
    document.documentElement.style.setProperty(
        "--input-area-height", `${$("#input-area").outerHeight()}px`
    );
    try {
        const msg = await getMessage(chatApiEndpoint, messageId);
        $("#message").val(msg.message);
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
    const chatApiEndpoint = "/messages";
    const websocketEndPoint = "ws://localhost:8080";
    let ws = new WebSocket(websocketEndPoint);

    ws.addEventListener("open", () => { // 接続完了後発火
        ws.send("");
    });
    ws.addEventListener("message", (e) => { // サーバーがsendすると発火
        const messages = JSON.parse(e.data);
        if (isMessageArray(messages)) {
            console.log(messages);
            showMessages(messages);
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
            top: $(this).position().top + e.offsetY,
            left: $(this).position().left + e.offsetX
        });
        return false;
    });
    $("body").on("click", () => {
        $("#contextmenu").hide();
    });
    $("#delete-msg").on("click", async function() {
        let messageId = $("#contextmenu").data("message-id");
        if (typeof messageId === "string") {
            await removeMessage(chatApiEndpoint, messageId);
        }
    });
    $("#edit-msg").on("click", async function() {
        const messageId = $("#contextmenu").data("message-id");
        await editMode(chatApiEndpoint, messageId);
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
        await sendMessage(chatApiEndpoint);
        $("#send").removeClass("is-loading");

        $("#shobo-main").animate({
            scrollTop: $("#shobo-main").height()
        });
    });
    $("#edited").on("click", async () => {
        $("#send").addClass("is-loading");
        await updateMessage(chatApiEndpoint);
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
    //</input area>

    //<message highlight>
    $(document).on("mouseover", ".shobo-message-div", function()  {
        $(this).addClass("has-background-grey-light");
    }).on("mouseout", ".shobo-message-div", function() {
        $(this).removeClass("has-background-grey-light");
    });
    //</message highlight>
});

