import { Message } from "./Message";

export function hasChar(input: string): boolean {
    return input.trim() !== "";
}

function isValidMessage(message: Message): boolean {
    let isValid = true;
    const $warnList = $("#warnList");
    $warnList.empty();
    if (!hasChar(message.name)) {
        isValid = false;
        $("<p></p>").text("名前を入力してください").appendTo($warnList);
    }
    if (!hasChar(message.message)) {
        isValid = false;
        $("<p></p>").text("メッセージを入力してください").appendTo($warnList);
    }
    return isValid;
}

export function getMessages(url: string): Promise<Array<Message>> {
    return fetch(url)
        .then((response) => response.json());
}

export function postMessage(url: string, message: Message) {
    fetch(url, {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function deleteMessage(url: string, messageId: number): Promise<any> {
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
                                         data-userid=${message.userId}> \
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
