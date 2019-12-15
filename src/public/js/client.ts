import { sendMessage, showMessages, removeMessage, checkInput} from "./messageHandler";
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

        $("html,body").animate({
            scrollTop: $(document).height()
        });
    });

    let timer: number;
    $(document).on("mousedown", ".shobo-message-div", function() {
        timer = window.setTimeout(async () => {
            if (window.confirm("削除しますか?")) {
                let messageId = $(this).data("message-id");
                console.log(messageId);
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
