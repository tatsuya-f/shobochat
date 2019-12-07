import { checkInput } from "./checkInput";

$(() => {
    const $updateButton = $("#update");
    const $sendButton = $("#send");
    const chatApiEndpoint = "http://localhost:8000/messages";

    function checkEscape(nameInput, messageInput): boolean{
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

    function getMessages(url = "") {
        return fetch(url)
            .then((response) => response.json());
    }

    function postMessage(url = "", message = {}) {
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(message),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    async function showMessages() {
        try{
            const messages = await getMessages(chatApiEndpoint);
            const $messageList = $("#messageList");
            $messageList.empty();
            messages.forEach((message) => {
                const time = new Date(message.time);
                const newMessage=`<p>time:${time} name:${message.name} message:${message.message}</p>`;
                $messageList.append(newMessage);
            });
        } catch (err) {
            console.log(err);
        }
    }

    async function sendMessage() {
        const message = {
            name: $("#name").val(),
            message: $("#message").val()
        };
        
        if(checkEscape(message.name, message.message)===true){
            //console.log("Escape send as empty input!")
            return;
        }
        
        try{
            await postMessage(chatApiEndpoint, message);
        } catch (err) {
            console.log(err);
        }

        $("#name").val("");
        $("#message").val("");
    }
        
    $updateButton.on("click", () => {
        showMessages();
    });

    $sendButton.on("click", () => {
        sendMessage();
    });

    showMessages();
});
