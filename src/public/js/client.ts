import { sendMessage, showMessages } from "./messageHandler";

$(() => {
    const chatApiEndpoint = "http://localhost:8000/messages";

    $("#update").on("click", () => {
        showMessages(chatApiEndpoint);
    });

    $("#send").on("click", () => {
        sendMessage(chatApiEndpoint);
    });

    showMessages(chatApiEndpoint);
});
