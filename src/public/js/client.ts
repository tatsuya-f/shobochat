"use strict";

$(() => {
    const $updateButton = $("#update");
    const $sendButton = $("#send");
    const chatApiEndpoint = "http://localhost:8000/messages";

    function getMessages(url = "") {
        return fetch(url)
            .then((response) => response.json());
    }

    function postMessage(url = "", message = {}) {
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(message),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    async function showMessages() {
        try{
            const messages = await getMessages(chatApiEndpoint);
            const $messageList = $("#messageList");
            $messageList.empty();
            messages.forEach((message) => {
                const time = new Date(message.time);
                const newMessage=`<p>time:${time} name:${message.name} message:${message.message}</p>`;
                $messageList.append(newMessage);
            });
        } catch (err) {
            console.log(err);
        }
    }

    async function sendMessage() {
        const message = {
            name: $("#name").val(),
            message: $("#message").val()
        };

        try{
            await postMessage(chatApiEndpoint, message);
        } catch (err) {
            console.log(err);
        }

        $("#name").val("");
        $("#message").val("");
    }
        
    $updateButton.on("click", () => {
        showMessages();
    });

    $sendButton.on("click", () => {
        sendMessage();
    });

    showMessages();
});
