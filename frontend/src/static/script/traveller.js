var user

function show(obj) {
    obj.fadeIn(500)
    obj.removeClass('d-none')
}

function hide(obj) {
    obj.fadeOut(500)
    obj.addClass('d-none')
}

window.onload = function () {
    user = JSON.parse(localStorage.getItem("user"))

    $("#profileBody").html(`
        <p><strong>First name: </strong>${user.first_name}</p>
        <p><strong>Last name: </strong>${user.last_name}</p>
        <p><strong>Email: </strong>${user.email}</p>
        <p><strong>Phone number: </strong>${user.phone_num}</p>
        <button class="btn-edit-profile btn btn-dark">Edit profile</button>
    `);
}

$(document).ready(function () {

    $(".carousel").carousel({
        pause: false
    })

    $(".btn-logout").click(function () {
        window.location.href = "../../index.html"
    })
})