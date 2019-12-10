import { sendMessage, showMessages } from "./messageHandler";

$(() => {
    const chatApiEndpoint = "http://localhost:8000/messages";

    $("#update").on("click", () => {
        showMessages(chatApiEndpoint);
    });

    $("#send").on("click", async () => {
        await sendMessage(chatApiEndpoint);
        await showMessages(chatApiEndpoint);
    });

    var timer: number;
    $(document).on("mousedown", ".messagediv", () => {
        timer = window.setTimeout(() => {
            if (window.confirm("削除しちゃう??")) {
                console.log("でりーと!");
            }
            else {
                console.log("えー、消しちゃえばいいのにー");
            }
        }, 1000);
    }).on("mouseup mouseleave", () => {
        clearTimeout(timer);
    });
    // $(document).on("dblclick", ".messagediv", function() {
    //     if (window.confirm("削除しますか?")) {
    //         console.log("DELETE");
    //     }
    //     else {
    //         console.log("CANCEL");
    //     }
    // });

    showMessages(chatApiEndpoint);
});
