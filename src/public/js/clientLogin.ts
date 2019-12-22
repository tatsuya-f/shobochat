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
    const name = String($("#name").val());
    const password = String($("#pass").val());
    
    const userInfo = {
        name: name,
        password: password
    };

    console.log(userInfo);
    if (isUserInfo(userInfo)) {
        console.log("fetch");

        try {
            const status = await CheckUserInfo(chatApiEndpoint, userInfo);
            if (status === 200) {
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
        console.log("clicked");
        $("#login").addClass("is-loading");
        await sendUserInfo(chatApiEndpoint);
        $("#login").removeClass("is-loading");
    });

    $("#jmp-register").on("click", async () => {
        location.href = "/register.html";
    });
});
