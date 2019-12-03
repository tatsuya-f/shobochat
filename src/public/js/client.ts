"use strict";

$(() => {
    var $update_button = $("#update");
    var $sendButton = $("#send");

    fetch("/messages")
        .then((response) => {
            return response.json();
        })
        .then((messages) => {
            var $message_list = $("div");
            $message_list.empty();
            messages.forEach((message) => {
                $message_list.append(`<p>time:${message.time} name:${message.name} message:${message.message}</p>`);
            });
        })
        .catch((err) => {
            console.log(err);
        });

    $update_button.on("click", () => {
        fetch("/messages")
            .then((response) => {
                return response.json();
            })
            .then((messages) => {
                var $messageList = $("div");
                $messageList.empty();
                messages.forEach((message) => {
                    $messageList.append(`<p>time:${message.time} name:${message.name} message:${message.message}</p>`);
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
