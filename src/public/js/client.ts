import { sendMessage, showMessages } from "./messageHandler";

$(() => {
    const chatApiEndpoint: string = "http://localhost:8000/messages";

    $("#update").on("click", () => {
        showMessages(chatApiEndpoint);
    });

    $("#send").on("click", () => {
        sendMessage(chatApiEndpoint);
    });

    showMessages(chatApiEndpoint);
});
