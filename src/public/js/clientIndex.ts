
$(() => {
    $("#jmp-register").on("click", async () => {
        $("#jmp-register").addClass("is-loading");
        
        //setTimeout(() => {
        window.location.href = "/register";
        //}, 1000);
        $("#jmp-register").removeClass("is-loading");
        

    });

    $("#jmp-login").on("click", async () => {
        $("#jmp-login").addClass("is-loading");
       
        //setTimeout(() => {
        window.location.href = "/login";
        //}, 1000);
        $("#jmp-login").removeClass("is-loading");
       

        
    });
});
