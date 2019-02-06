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

    $('#travelerRegisterBirthDate').datepicker({
        uiLibrary: 'bootstrap4'
    });

    $('#dropdown').dropdown({
        uiLibrary: 'bootstrap4'
    });

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
                    firstName: $("#travelerRegisterFname").val(),
                    lastName: $("#travelerRegisterSname").val(),
                    gender: $("#travelerRegisterGender").val(),
                    email: $("#travelerRegisterEmail").val(),
                    phoneNum: $("#travelerRegisterPhone").val(),
                    dateOfBirth: $("#travelerRegisterBirthDate").val()
                },
                success: function () {
                    $("#modalTitle").html("Register completed");
                    $("#modalBody").html("Please log in with this account.")
                    $("#modal").modal("show")
                },
                error: function (error) {
                    $("#modalTitle").html(JSON.stringify(error))
                    $("#modalBody").html("Please try again.")
                    $("#modal").modal("show")
                }
            })
        }
    })
})