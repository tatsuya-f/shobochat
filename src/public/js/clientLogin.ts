import { UserInfo, isUserInfo } from "./UserInfo";

function CheckUserInfo(url: string, userInfo: UserInfo): Promise<number> {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    }).then (res => res.status);
}

export async function sendUserInfo(chatApiEndpoint: string): Promise<void> {
    const userInfo = {
        name: $("#name").val(),
        pass: $("#pass").val()
    };

    if (isUserInfo(userInfo)) {

        try {
            const status = await CheckUserInfo(chatApiEndpoint, userInfo);
            if (status === 500) {
                alert("ちゃっとにいどうします。");
                setTimeout(() => {
                    window.location.href = "/chat";   
                }, 1000);
            } else {
                console.log("GET Failed");
            }
          
        } catch (err) {
            console.log(err);
        }

    }

}


$(() => {
    const chatApiEndpoint = "http://localhost:8000/login";

    $("#login").on("click", async () => { 
        $("#login").addClass("is-loading");
        await sendUserInfo(chatApiEndpoint);
        $("#login").removeClass("is-loading");
    });

    $("#jmp-register").on("click", async () => {
        location.href = "/register.html";
    });
});
