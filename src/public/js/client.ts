"use strict";

$(() => {
    var $updateButton = $("#update");
    var $sendButton = $("#send");

    fetch("/messages")
        .then((response) => {
            return response.json();
        })
        .then((messages) => {
            var $messageList = $("div");
            $messageList.empty();
            messages.forEach((message) => {
                const time = new Date(message.time);
                const newMessage=`<p>time:${time} name:${message.name} message:${message.message}</p>`;
                $message_list.append(newMessage);

            });
        })
        .catch((err) => {
            console.log(err);
        });

    $updateButton.on("click", () => {
        fetch("/messages")
            .then((response) => {
                return response.json();
            })
            .then((messages) => {
                var $messageList = $("div");
                $messageList.empty();
                messages.forEach((message) => {
                    const time = new Date(message.time);
                    const newMessage=`<p>time:${time} name:${message.name} message:${message.message}</p>`;
                    $message_list.append(newMessage);
                });
            })
            .catch((err) => {
                console.log(err);
            });
    });

    $sendButton.on("click", () => {
        var requestBody = {
            name: $("#name").val(), 
            message: $("#message").val()
        };
        fetch("/messages", {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(() => {
                $("#name").val("");
                $("#message").val("");
            })
            .catch((err) => {
                console.log(err);
            });
    });
});
