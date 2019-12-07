import { postJson, getJson } from "./jsonHandler";

export function checkInput(input: string): boolean {
    for(let ch of input) {
        if(ch !== " " && ch !== "\t") {
            return true;
        }
    }
    return false;
}

export function checkEscape(nameInput: string, messageInput: string): boolean {
    let warnEscape: boolean = false;
    const $warnList: JQuery = $("#warnList");
    $warnList.empty();
    if(!checkInput(nameInput)){
        warnEscape = true;
        $("<p></p>").text("名前を入力してください").appendTo($warnList);
    }
    if(!checkInput(messageInput)){
        warnEscape = true;
        $("<p></p>").text("メッセージを入力してください").appendTo($warnList);
    }
    return warnEscape;
}

export async function sendMessage(chatApiEndpoint: string) {
    // TODO: use interface
    const message = {
        name: $("#name").val() as string,
        message: $("#message").val() as string
    };

    if(checkEscape(message.name, message.message)) {
        //console.log("Escape send as empty input!")
        return;
    }

    try {
        await postJson(chatApiEndpoint, message);
    } catch (err) {
        console.log(err);
    }

    $("#name").val("");
    $("#message").val("");
}

export async function showMessages(chatApiEndpoint: string) {
    try {
        const messages = await getJson(chatApiEndpoint);
        const $messageList: JQuery = $("#messageList");

        $messageList.empty();
        messages.forEach((message) => {
            const time = new Date(message.time);
            const newMessage = `<p>time:${time} name:${message.name} message:${message.message}</p>`;
            $messageList.append(newMessage);
        });
    } catch (err) {
        console.log(err);
    }
}
