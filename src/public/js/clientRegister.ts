import { UserInfo, isUserInfo } from "./UserInfo";


function RegisterUserInfo(url: string, userInfo: UserInfo) {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    });
}

export async function Register(chatApiEndpoint: string): Promise<void> {
    const userInfo = {
        name: $("#name").val(),
        pass: $("#pass").val()
    };

    if (isUserInfo(userInfo)) {
        try {
            await RegisterUserInfo(chatApiEndpoint, userInfo);
            /*
            if (status === 500) {

                console.log("POST Failed");
            } else {

                console.log("POST Failed");
            }
            */
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
