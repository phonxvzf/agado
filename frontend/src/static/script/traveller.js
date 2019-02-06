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

    $("#profileBody").delegate(".btn-edit-profile", "click", function () {
        $("#profileBody").html(`
            <div class="container">
                <div class="w-40 mx-auto">
                    <p><strong>First name: </strong><input type="text" class="form-control" id="editFname" placeholder="${user.first_name}" required></p>
                    <p><strong>Last name: </strong><input type="text" class="form-control" id="editSname" placeholder="${user.last_name}" required></p>
                    <p><strong>Email: </strong><input type="email" class="form-control" id="editEmail" placeholder="${user.email}" required></p>
                    <p><strong>Phone number: </strong><input type="tel" class="form-control" id="editTel" placeholder="${user.phone_num}" required></p>
                </div>
                <hr class="my-4">
                <div class="row">
                    <div class="col-2"></div>
                    <button class="btn-save btn btn-success vcenter col-3">SAVE CHANGES</button>
                    <div class="col-2"></div>
                    <button class="btn-delete btn btn-danger vcenter col-3">DELETE ACCOUNT</button>
                    <div class="col-2"></div>
                </div>
            </div>
        `);
    })

    $("#profileBody").delegate(".btn-save", "click", function () {
        if ($("#editFname").val())
            user.first_name = $("#editFname").val();
        if ($("#editSname").val())
            user.last_name = $("#editSname").val();
        if ($("#editEmail").val())
            user.email = $("#editEmail").val();
        if ($("#editTel").val())
            user.phone_num = $("#editTel").val();

        localStorage.setItem("user", user)
        $.ajax({
            method: "PUT",
            url: `${window.location.origin}/api/user`,
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
            data: {
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                gender: user.gender,
                email: user.email,
                phone_num: user.phone_num,
                date_of_birth: user.date_of_birth,
                user_type: user.user_type
            },
            success: function () {
                $("#modalTitle").html("Save completed");
                $("#modalBody").html("Your profile changed.")
                $("#modalFooter").html(`<button type="button" class="btn btn-dark" data-dismiss="modal">Close</button>`)
                $("#modal").modal("show")

                $("#profileBody").html(`
                    <p><strong>First name: </strong>${user.first_name}</p>
                    <p><strong>Last name: </strong>${user.last_name}</p>
                    <p><strong>Email: </strong>${user.email}</p>
                    <p><strong>Phone number: </strong>${user.phone_num}</p>
                    <button class="btn-edit-profile btn btn-dark">Edit profile</button>
                `);
            }
        })
    })

    $("#profileBody").delegate(".btn-delete", "click", function () {
        $("#modalTitle").html("Are you sure?");
        $("#modalBody").html("You won't be able to revert this!")
        $("#modalFooter").html(`
            <button type="button" class="btn-confirm-del btn btn-danger">Yes, delete it!</button>
            <button type="button" class="btn btn-dark" data-dismiss="modal">Cancel</button>
        `)
        $("#modal").modal("show")
    })

    $("#modalFooter").delegate(".btn-confirm-del", "click", function () {
        $.ajax({
            method: "DELETE",
            url: `${window.location.origin}/api/user`,
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
            success: function () {
                $("#modalTitle").html("Delete completed");
                $("#modalBody").html("Your accout won't be able to access anymore.")
                $("#modalFooter").html(`<button type="button" class="btn btn-dark" data-dismiss="modal">Close</button>`)
                $("#modal").modal("show")

                setTimeout(function(){
                    window.location.href = "../../index.html"
                }, 3000);
            }
        })
    })
})