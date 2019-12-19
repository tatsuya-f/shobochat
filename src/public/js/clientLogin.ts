import { UserInfo, isUserInfo } from "./UserInfo";

function CheckUserInfo(url: string, userInfo: UserInfo): Promise<number> {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    }).then(res => res.status);
}

export async function sendUserInfo(chatApiEndpoint: string): Promise<void> {
    const userInfo = {
        name: $("#name").val(),
        pass: $("#pass").val()
    };

    if (isUserInfo(userInfo)) {

        try {
            const status = await CheckUserInfo(chatApiEndpoint, userInfo);
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

    $("#signin").on("click", async () => {
        $("#signin").addClass("is-loading");
        await sendUserInfo(chatApiEndpoint);
        $("#signin").removeClass("is-loading");
    });

    $("#signin-register").on("click", async () => {
      
        /*
        fetch("http://localhost:8000/signup", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        }).then(res => res.json())
            .then(res =>  {
                console.log(res.redirect);             
            });
    */
        location.href = "http://localhost:8000/signup.html";
        
    });




});
