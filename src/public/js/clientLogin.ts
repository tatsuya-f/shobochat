import { UserClient } from "./UserClient";

export async function login(chatApiEndpoint: string): Promise<void> {
    const name = $("#name").val();
    const password = $("#pass").val();
    if (typeof name !== "string" || typeof password !== "string") { // reject
        alert("なまえとあいことばはもじでいれてください。");
        return;
    }
    const user = new UserClient(name, password);
    try {
        const status = await user.post(chatApiEndpoint);
        if (status === 200) {
            window.location.href = "/chat";
        } else {
            alert("なまえかあいことばがちがいます。");
            console.log("GET Failed");
        }
    } catch (err) {
        console.log(err);
    }
}


$(() => {
    const chatApiEndpoint = "/login";
    $("#login").on("click", async () => {
        console.log("clicked");
        $("#login").addClass("is-loading");
        await login(chatApiEndpoint);
        $("#login").removeClass("is-loading");
    });
});
