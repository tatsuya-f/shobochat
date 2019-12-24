import { UserInfo, isUserInfo } from "./User";

async function registerUserInfo(url: string, userInfo: UserInfo): Promise<number> {
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    });
    return res.status;
}

export async function register(chatApiEndpoint: string): Promise<void> {
    const userInfo = {
        name: $("#name").val(),
        password: $("#pass").val()
    };

    console.log(userInfo);
    if (isUserInfo(userInfo)) {
        try {
            const status = await registerUserInfo(chatApiEndpoint, userInfo);
            if (status === 200) {
                window.location.href = "/chat";
            } else {
                console.log("POST Failed");
            }
        } catch (err) {
            console.log(err);
        }
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
