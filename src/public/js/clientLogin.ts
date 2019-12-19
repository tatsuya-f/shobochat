import { UserInfo, isUserInfo } from "./UserInfo";

function CheckUserInfo(url: string, userInfo: UserInfo) {
    return fetch(url, {
        method: "GET",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    });
}

export async function sendUserInfo(chatApiEndpoint: string): Promise<void> {
    const userInfo = {
        name: $("#name").val(),
        pass: $("#pass").val()
    };

    if (isUserInfo(userInfo)) {

        try {
            const data = await CheckUserInfo(chatApiEndpoint, userInfo);
            console.log(data.status);
            // window.location = data;
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
    const chatApiEndpoint = "http://localhost:8000/login";

    $("#register").on("click", async () => {
        $("#register").addClass("is-loading");
        await sendUserInfo(chatApiEndpoint);
        $("#register").removeClass("is-loading");
    });

    $("#signin-register").on("click", async () => {


        fetch("http://localhost:8000/login", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(res =>  {
                console.log(res.redirect);
            });

        location.href = "http://localhost:8000/signup.html";

    });
});
