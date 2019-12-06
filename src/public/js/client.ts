import { sendMessage, showMessages } from "./messageHandler";

$(() => {
    const $updateButton = $("#update");
    const $sendButton = $("#send");
    const chatApiEndpoint = "http://localhost:8000/messages";
            
    $updateButton.on("click", () => {
        showMessages(chatApiEndpoint);
    });

    $sendButton.on("click", () => {
        sendMessage(chatApiEndpoint);
    });

    showMessages();
});
