import { Message } from "./Message";

export function hasChar(input: string): boolean {
    return input.trim() !== "";
}

function isValidMessage(message: Message): boolean {
    let isValid = true;
    if (!hasChar(message.name)) {
        isValid = false;
        $("#name").css("background-color", "red");
    }
    else {
        $("#name").css("background-color", "white");
    }
    if (!hasChar(message.message)) {
        isValid = false;
        $("#message").css("background-color", "red");
    }
    else {
        $("#message").css("background-color", "white");
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

function deleteMessage(url: string, messageId: number) {
    fetch(url, {
        method: "DELETE",
        body: JSON.stringify({
            messageId: messageId
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function sendMessage(chatApiEndpoint: string): Promise<void> {
    const message: Message = {
        name: $("#name").val() as string,
        message: $("#message").val() as string
    };

    if (!isValidMessage(message)) {
        return;
    }

    try {
        await postMessage(chatApiEndpoint, message);
    } catch (err) {
        console.log(err);
    }

    $("#message").val("");
}

export async function showMessages(chatApiEndpoint: string): Promise<void> {
    try {
        const messages = await getMessages(chatApiEndpoint);
        const $messageList = $("#messageList");

        $messageList.empty();
        messages.forEach((message) => {
            if (message.time) {
                const time = new Date(message.time);
                const newMessage = `<div class="messagediv" \
                                         data-messageid=${message.id} \
                                       <p class="name">name:${message.name}</p> \
                                       <p class="time">time:${time}</p> \
                                       <p class="message">message:${message.message}</p> \
                                    </div>`;
                $messageList.append(newMessage);
            }
        });
    } catch (err) {
        console.log(err);
    }
}

export async function removeMessage(chatApiEndpoint: string, messageId: number): Promise<void> {
    await deleteMessage(chatApiEndpoint, messageId);
    await showMessages(chatApiEndpoint);
}

