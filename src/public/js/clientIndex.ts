

$(() => {

    $("#jmp-register").on("click", async () => {
        $("#register").addClass("is-loading");
        alert("ろうろくがめんにいどうします。");
        setTimeout(() => {
            window.location.href = "/register";   
        }, 1000);
        
    });

    $("#jmp-login").on("click", async () => {
        $("#login").addClass("is-loading");
        alert("ろぐいんがめんにいどうします。");
        setTimeout(() => {
            window.location.href = "/login";   
        }, 1000);

    });



});
