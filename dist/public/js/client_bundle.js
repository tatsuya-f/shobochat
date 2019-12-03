(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    })
        .catch(function (err) {
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
        })
            .catch(function (err) {
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
        })
            .catch(function (err) {
            console.log(err);
        });
    });
});

},{}]},{},[1]);
