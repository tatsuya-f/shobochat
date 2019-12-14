import { Message, isMessage } from "./Message";

export function hasChar(input: string): boolean {
    return input.trim() !== "";
}

function isValidMessage(message: Message): boolean {
    let isValid = true;
    if (!hasChar(message.name)) {
        isValid = false;
        $("#name").addClass("is-danger");
    }
    else {
        $("#name").removeClass("is-danger");
    }
    if (!hasChar(message.message)) {
        isValid = false;
        $("#message").addClass("is-danger");
    }
    else {
        $("#message").removeClass("is-danger");
    }
    return isValid;
}

function postMessage(url: string, message: Message): Promise<number> {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    }).then(res => res.status);
}

function deleteMessage(url: string, messageId: number): Promise<number> {
    return fetch(`${url}/${messageId}`, {
        method: "DELETE",
        headers: {
            "Content-Length": "0"
        },
        credentials: "same-origin"
    }).then(res => res.status);
}

export async function sendMessage(chatApiEndpoint: string): Promise<void> {
    const message = {
        name: $("#name").val(),
        message: $("#message").val()
    };

    if (isMessage(message) && isValidMessage(message)) {
        try {
            const status = await postMessage(chatApiEndpoint, message);
            const $queryMessage = $("#queryMessage");
            if (status === 200) {
                $queryMessage.html("メッセージを送信しました");
                $queryMessage.css("color", "black");
            } else {
                $queryMessage.html("メッセージを送信できませんでした");
                $queryMessage.css("color", "red");
                console.log("POST Failed");
            }
        } catch (err) {
            console.log(err);
        }
    }
    $("#message").val("");
}

export function showMessages(messages: Array<Message>) {
    const $messageList = $("#messageList");
    $messageList.empty();
    messages.forEach((message) => {
        if (message.time !== undefined) {
            const time = new Date(message.time);
            const messageTag = `<div class="messagediv" \
                data-messageid=${message.id}> \
                <span class="name">${escapeHTML(message.name)}</span> \
                <span class="time">${time}</span> \
                <pre class="message">${escapeHTML(message.message)}</pre> \
                </div>`;
            $messageList.prepend(messageTag);
        }
    });
}


export async function removeMessage(chatApiEndpoint: string, messageId: number): Promise<void> {
    const status = await deleteMessage(chatApiEndpoint, messageId);
    const $queryMessage = $("#queryMessage");
    if (status === 200) {
        $queryMessage.html("メッセージを削除しました");
        $queryMessage.css("color", "black");
    } else {
        $queryMessage.html("メッセージを削除できませんでした");
        $queryMessage.css("color", "red");
        console.log("DELETE Failed");
    }
}


export function escapeHTML(str : string): string {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#x27;");
    str = str.replace(/`/g, "&#x60;");
    return str;
}
