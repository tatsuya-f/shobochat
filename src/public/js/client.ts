import { sendMessage, showMessages, removeMessage } from "./messageHandler";
import { isMessageArray } from "./Message";

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

    $("#update").on("click", () => {
    });

    $("#send").on("click", async () => {
        $("#send").addClass("is-loading");
        await sendMessage(chatApiEndpoint);
        $("#send").removeClass("is-loading");
        // $("body").animate({ scrollTop: $(document).height() }, 100);
    });

    let timer: number;
    $(document).on("mousedown", ".messagediv", function() {
        timer = window.setTimeout(async () => {
            if (window.confirm("削除しますか?")) {
                let messageId = $(this).data("messageid");
                if (typeof messageId === "number") {
                    await removeMessage(chatApiEndpoint, $(this).data("messageid"));
                }
                console.log($(this).data("messageid"));
                console.log($(this).data("userid"));
            }
        }, 1000);
    }).on("mouseup mouseleave", () => {
        clearTimeout(timer);
    });

    $(document).on("mouseover", ".messagediv", function() {
        $(this).addClass("message is-dark");

    }).on("mouseout", ".messagediv", function() {
        $(this).removeClass("message is-dark");
    });
});
