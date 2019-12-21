import {
    sendMessage,
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
    const selected = text.substr(startpos, endpos);
    const afterCursor = after + text.substr(endpos, text.length);
    $textarea.val(beforeCursor + selected + afterCursor);
    $textarea.focus();
    $textarea.prop({
        "selectionStart": beforeCursor.length,
        "selectionEnd": beforeCursor.length
    });
}

$(() => {
    const chatApiEndpoint = "http://localhost:8000/messages";
    const websocketEndPoint = "ws://localhost:8000/messages";
    let ws = new WebSocket(websocketEndPoint);

    ws.addEventListener("open", () => { // 接続完了後発火
        ws.send(JSON.stringify({ operation: "sessionStart" }));
    });
    ws.addEventListener("message", (ev) => { // サーバーがsendすると発火
        const messages = JSON.parse(ev.data);
        if (isMessageArray(messages)) {
            showMessages(messages);
        }
    });

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

    $("#update").on("click", () => {
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

        $("html,body").animate({
            scrollTop: $(document).height()
        });
    });

    let timer: number;
    $(document).on("mousedown", ".shobo-message-div", function() {
        timer = window.setTimeout(async () => {
            if (window.confirm("削除しますか?")) {
                let messageId = $(this).data("message-id");
                if (typeof messageId === "number") {
                    await removeMessage(chatApiEndpoint, messageId);
                }
            }
        }, 1000);
    }).on("mouseup mouseleave", () => {
        clearTimeout(timer);
    });

    $(document).on("mouseover", ".shobo-message-div", function()  {
        $(this).addClass("has-background-grey-light");

    }).on("mouseout", ".shobo-message-div", function() {
        $(this).removeClass("has-background-grey-light");
    });
    $("#name").on("input", () => {
        checkInput();
    });

    $("#message").on("input", () => {
        checkInput();
    });

});
