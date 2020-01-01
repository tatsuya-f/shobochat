import { UserClient } from "./UserClient";

export async function register(chatApiEndpoint: string): Promise<void> {
    const name = $("#name").val();
    const password = $("#pass").val();
    const passwordVerify = $("#pass-verify").val();
    if (password !== passwordVerify) {  // reject
        alert("あいことばがいっちしません。");
        return;
    }
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
            alert("とうろくできませんでした。");
            console.log("POST Failed");
        }
    } catch (err) {
        console.log(err);
    }
}

$(() => {
    const chatApiEndpoint = "/register";
    $("#register").on("click", async () => {
        $("#register").addClass("is-loading");
        await register(chatApiEndpoint);
        $("#register").removeClass("is-loading");
    });
});
