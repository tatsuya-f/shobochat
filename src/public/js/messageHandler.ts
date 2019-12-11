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

function getMessages(url: string): Promise<Array<Message>> {
    return fetch(url)
        .then((response) => response.json());
}

function postMessage(url: string, message: Message) {
    fetch(url, {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

function deleteMessage(url: string, messageId: number): Promise<number> {
    return fetch(`${url}/${messageId}`, {
        method: "DELETE",
        headers: {
            "Content-Length": "0"
        }
    }).then(res => res.status);
}

export async function sendMessage(chatApiEndpoint: string): Promise<void> {
    const message = {
        name: $("#name").val(),
        message: $("#message").val()
    };

    if (isMessage(message) && isValidMessage(message)) {
        try {
            await postMessage(chatApiEndpoint, message);
        } catch (err) {
            console.log(err);
        }
    }
    $("#message").val("");
}

export async function showMessages(chatApiEndpoint: string): Promise<void> {
    try {
        const messages = await getMessages(chatApiEndpoint);
        const $messageList = $("#messageList");
        $messageList.empty();
        console.log(messages);
        messages.forEach((message) => {
            if (message.time !== undefined) {
                const time = new Date(message.time);
                const messageTag = `<div class="messagediv" \
                                         data-messageid=${message.id}> \
                                       <span class="name">${escapeHTML(message.name)}</span> \
                                       <span class="time">${time}</span> \
                                       <p class="message">${escapeHTML(message.message)}</p> \
                                    </div>`;
                $messageList.prepend(messageTag);
            }
        });
    } catch (err) {
        console.log(err);
    }
}

export async function removeMessage(chatApiEndpoint: string, messageId: number): Promise<void> {
    const status = await deleteMessage(chatApiEndpoint, messageId);
    if (status !== 200) {
        console.log("DELETE Failed");
    }
    await showMessages(chatApiEndpoint);
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
