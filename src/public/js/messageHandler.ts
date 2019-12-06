import { postJson, getJson } from "./jsonHandler";

export async function sendMessage(chatApiEndpoint = "") {
    const message = {
        name: $("#name").val(),
        message: $("#message").val()
    };

    try{
        await postJson(chatApiEndpoint, message);
    } catch (err) {
        console.log(err);
    }

    $("#name").val("");
    $("#message").val("");
}


export async function showMessages(chatApiEndpoint = "") {
    try{
        const messages = await getJson(chatApiEndpoint);
        const $messageList = $("#messageList");

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
