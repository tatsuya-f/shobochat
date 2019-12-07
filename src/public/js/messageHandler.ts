import { postJson, getJson } from "./jsonHandler";

export function checkInput(a): boolean{
    if(a==="")return false; 
    else{
        let space: boolean = false;
        let m: number = 0;
        while(m <= a.length-1){
            if(a.charAt(m)!==" " && a.charAt(m)!=="	")space = true;
            m++;
        }
        return space;
    }
}

export function checkEscape(nameInput, messageInput): boolean{
    let warnEscape: boolean = false;
    const $warnMes = $("#warnList");
    $warnMes.empty();
    if(checkInput(nameInput)===false){
        warnEscape=true;
        const $mes = $("<p></p>");
        $mes.text("名前を入力してください").appendTo($warnMes);           
    }
    if(checkInput(messageInput)===false){
        warnEscape=true;
        const $mes = $("<p></p>");
        $mes.text("メッセージを入力してください").appendTo($warnMes);           
    }
    return warnEscape;
}

export async function sendMessage(chatApiEndpoint = "") {
    const message = {
        name: $("#name").val(),
        message: $("#message").val()
    };

    if(checkEscape(message.name, message.message)===true){
        //console.log("Escape send as empty input!")
        return;
    }

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
