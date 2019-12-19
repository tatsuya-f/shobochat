import { UserInfo, isUserInfo } from "./UserInfo";


function RegisterUserInfo(url: string, userInfo: UserInfo): Promise<number> {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    }).then(res => res.status);
}

export async function Register(chatApiEndpoint: string): Promise<void> {
    const userInfo = {
        name: $("#name").val(),
        pass: $("#pass").val()
    };

    if (isUserInfo(userInfo)) {
        try {
            const status = await RegisterUserInfo(chatApiEndpoint, userInfo);
            if (status === 200) {

                console.log("POST");
            } else {

                console.log("POST Failed");
            }
        } catch (err) {
            console.log(err);
        }

    }

}

$(() => {
    const chatApiEndpoint = "http://localhost:8000/messages";

    $("#register").on("click", async () => {
        $("#register").addClass("is-loading");
        await Register(chatApiEndpoint);
        $("#register").removeClass("is-loading");
    });
 

});
