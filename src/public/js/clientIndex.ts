$(() => {
    $("#jmp-register").on("click", async () => {
        $("#jmp-register").addClass("is-loading");
        window.location.href = "/register";
        $("#jmp-register").removeClass("is-loading");
    });

    $("#jmp-login").on("click", async () => {
        $("#jmp-login").addClass("is-loading");
        window.location.href = "/login";
        $("#jmp-login").removeClass("is-loading");
    });
});
