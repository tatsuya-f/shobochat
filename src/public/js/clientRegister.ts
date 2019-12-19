import { UserInfo, isUserInfo } from "./UserInfo";

function registerUserInfo(url: string, userInfo: UserInfo) {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    });
}

export async function register(chatApiEndpoint: string): Promise<void> {
    const userInfo = {
        name: $("#name").val(),
        password: $("#pass").val()
    };

    console.log(userInfo);
    if (isUserInfo(userInfo)) {
        try {
            const res = await registerUserInfo(chatApiEndpoint, userInfo);
            const status = res.status;
            if (status === 200) {
                window.location.href = "/chat";
            } else {
                console.log("POST Failed");
            }
        } catch (err) {
            console.log(err);
        }

    } else {
        console.log("HOGEHOGE");
    }

}

$(() => {
    const chatApiEndpoint = "http://localhost:8000/register";
    $("#register").on("click", async () => {
        $("#register").addClass("is-loading");
        await register(chatApiEndpoint);
        $("#register").removeClass("is-loading");
    });
});
