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
        password: $("#pass").val()
    };

    console.log(userInfo);
    if (isUserInfo(userInfo)) {
        try {
            const status = await CheckUserInfo(chatApiEndpoint, userInfo);
            if (status === 200) {
                window.location.href = "/chat";
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

    $("#jmp-register").on("click", () => {
        location.href = "/register";
    });
});
