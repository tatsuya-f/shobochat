
$(() => {
    $("#jmp-register").on("click", async () => {
        $("#register").addClass("is-loading");
        setTimeout(() => {
            window.location.href = "/register";
        }, 1000);

    });

    $("#jmp-login").on("click", async () => {
        $("#login").addClass("is-loading");
        setTimeout(() => {
            window.location.href = "/login";
        }, 1000);

    });
});
