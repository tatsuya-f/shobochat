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

    showMessages(chatApiEndpoint);
});
