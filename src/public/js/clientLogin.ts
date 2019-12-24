import { UserInfo, isUserInfo } from "./User";

async function CheckUserInfo(url: string, userInfo: UserInfo): Promise<number> {
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

export async function sendUserInfo(chatApiEndpoint: string): Promise<void> {
    const userInfo = {
        name: $("#name").val(),
        password: $("#pass").val()
    };

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
    const chatApiEndpoint = "/login";
    $("#login").on("click", async () => {
        console.log("clicked");
        $("#login").addClass("is-loading");
        await sendUserInfo(chatApiEndpoint);
        $("#login").removeClass("is-loading");
    });
});
