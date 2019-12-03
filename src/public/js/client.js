"use strict";
$(function () {
    var $update_button = $("#update");
    var $sendButton = $("#send");
    fetch("/messages")
        .then(function (response) {
        return response.json();
    })
        .then(function (messages) {
        var $message_list = $("div");
        $message_list.empty();
        messages.forEach(function (message) {
            $message_list.append("<p>time:" + message.time + " name:" + message.name + " message:" + message.message + "</p>");
        });
    })["catch"](function (err) {
        console.log(err);
    });
    $update_button.on("click", function () {
        fetch("/messages")
            .then(function (response) {
            return response.json();
        })
            .then(function (messages) {
            var $messageList = $("div");
            $messageList.empty();
            messages.forEach(function (message) {
                $messageList.append("<p>time:" + message.time + " name:" + message.name + " message:" + message.message + "</p>");
            });
        })["catch"](function (err) {
            console.log(err);
        });
    });
    $sendButton.on("click", function () {
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
            .then(function () {
            $("#name").val("");
            $("#message").val("");
        })["catch"](function (err) {
            console.log(err);
        });
    });
});
