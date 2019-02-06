function show(obj) {
    obj.fadeIn(500)
    obj.removeClass('d-none')
}

function hide(obj) {
    obj.fadeOut(500)
    obj.addClass('d-none')
}

$(document).ready(function () {

    $(".carousel").carousel({
        pause: false
    })

    $("#travelerBtn").click(function () {
        hide($("#welcome"))
        show($("#travelerUser"))
    })

    $(".back-btn").click(function () {
        hide($("#travelerUser"))
        show($("#welcome"))
    })

    $("#travelerLoginLink").click(function () {
        $("#travelerRegisterLink").removeClass("active")
        $(this).addClass("active")
        hide($("#travelerRegisterForm"))
        show($("#travelerLoginForm"))
    })

    $("#travelerRegisterLink").click(function () {
        $("#travelerLoginLink").removeClass("active")
        $(this).addClass("active")
        hide($("#travelerLoginForm"))
        show($("#travelerRegisterForm"))
    })

    $("#travelerRegisterForm").delegate(".btn-register", "click", function () {
        if ($("#travelerRegisterUsr").val() && $("#travelerRegisterPwd").val() && $("#travelerRegisterFname").val() && $("#travelerRegisterSname").val() &&
            $("#travelerRegisterGender").val() && $("#travelerRegisterEmail").val() && $("#travelerRegisterPhone").val() && $("#travelerRegisterBirthDate").val()) {
            $.ajax({
                method: "POST",
                url: `${window.location.origin}/api/user`,
                data: {
                    username: $("#travelerRegisterUsr").val(),
                    password: $("#travelerRegisterPwd").val(),
                    first_name: $("#travelerRegisterFname").val(),
                    last_name: $("#travelerRegisterSname").val(),
                    gender: $("#travelerRegisterGender").val(),
                    email: $("#travelerRegisterEmail").val(),
                    phone_num: $("#travelerRegisterPhone").val(),
                    date_of_birth: $("#travelerRegisterBirthDate").val(),
                    user_type: "traveler"
                },
                success: function () {
                    $("#modalTitle").html("Register completed");
                    $("#modalBody").html("Please log in with this account.")
                    $("#modal").modal("show")

                    $("#travelerRegisterLink").removeClass("active")
                    $(this).addClass("active")
                    hide($("#travelerRegisterForm"))
                    show($("#travelerLoginForm"))
                },
                error: function (error) {
                    $("#modalTitle").html("This username is taken")
                    $("#modalBody").html("Please try another username.")
                    $("#modal").modal("show")
                }
            })
        }
    })

    $("#travelerLoginForm").delegate(".btn-login", "click", function () {
        event.preventDefault()
        $.ajax({
            method: "POST",
            url: `${window.location.origin}/api/login`,
            data: {
                username: $("#travelerLoginUsr").val(),
                password: $("#travelerLoginPwd").val()
            },
            success: function (usr) {
                localStorage.setItem("user", JSON.stringify(usr))

                window.location.href = "../../traveller.html"
            },
            error: function (error) {
                if ($("#travelerLoginUsr").val() && $("#travelerLoginPwd").val()) {
                    $("#modalTitle").html("Incorrect username or password");
                    $("#modalBody").html("Please try again.");
                    $("#modal").modal("show");
                }
            }
        });
    })
})