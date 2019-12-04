"use strict";

$(() => {
    const $updateButton = $("#update");
    const $sendButton = $("#send");

    (async () => {
        try{
            const response = await fetch("/messages");
            const messages = await response.json();
            const $messageList = $("#messageList");
            $messageList.empty();
            messages.forEach((message) => {
                const time = new Date(message.time);
                const newMessage=`<p>time:${time} name:${message.name} message:${message.message}</p>`;
                $messageList.append(newMessage);
            });

        }catch (err){
            console.log(err);
        }

    })();


    $updateButton.on("click", () => {
        (async () => {
            try{
                const response = await fetch("/messages");
                const messages = await response.json();
                const $messageList = $("#messageList");
                $messageList.empty();
                messages.forEach((message) => {
                    const time = new Date(message.time);
                    const newMessage=`<p>time:${time} name:${message.name} message:${message.message}</p>`;
                    $messageList.append(newMessage);

                });

            }catch (err){
                console.log(err);
            }

        })();

    });

    $sendButton.on("click", () => {
        const requestBody = {
            name: $("#name").val(),
            message: $("#message").val()
        };

        (async () =>{
            try{
                await fetch("/messages", {
                    method: "POST",
                    body: JSON.stringify(requestBody),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                $("#name").val("");
                $("#message").val("");
            }catch (err) {
                console.log(err);
            }
        })();
    });
});
