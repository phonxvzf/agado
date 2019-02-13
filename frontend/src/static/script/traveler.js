var user
var hotels

function show(obj) {
    obj.fadeIn(500)
    obj.removeClass('d-none')
}

function hide(obj) {
    obj.fadeOut(500)
    obj.addClass('d-none')
}

function updateProfile(user) {
    $("#Fname").html(user.first_name)
    $("#Sname").html(user.last_name)
    $("#Email").html(user.email)
    $("#Tel").html(user.phone_num)
}

function searchByHotelName(name) {
    $.ajax({
        method: "GET",
        url: `${window.location.origin}/api/search?hotel_name=${name}`,
        success: function (htls) {
            hotels = htls

            $("#hotelCards").html("")
            for (var i = 0; i < hotels.length; ++i) {
                var hotel = hotels[i]
                $("#hotelCards").append(`
                    <div class="col-lg-5 col-md-5 col-sm-5 col-12 card bg-light mx-1 my-2">
                        <div class="card-header">
                            <div class="text-center">${hotel.name}</div>
                        </div>
                        <div class="card-body">
                            <p>Address: ${hotel.addr}</p>
                            <p>Province: ${hotel.prov}</p>
                            <p>Latitude: ${hotel.lat}</p>
                            <p>Longitude: ${hotel.long}</p>
                        </div>
                    </div>
                `)
            }
        }
    })
}

window.onload = function () {
    user = JSON.parse(localStorage.getItem("user"))
    updateProfile(user)

    searchByHotelName(" ")
}

$(document).ready(function () {

    $(".carousel").carousel({
        pause: false
    })

    $(".btn-logout").click(function () {
        window.location.href = "../../index.html"
    })

    user = JSON.parse(localStorage.getItem("user"))

    $("#profileData").delegate(".btn-edit-profile", "click", function () {
        $("#editFname").attr("placeholder", user.first_name)
        $("#editSname").attr("placeholder", user.last_name)
        $("#editEmail").attr("placeholder", user.email)
        $("#editTel").attr("placeholder", user.phone_num)

        $("#profileData").addClass('d-none')
        $("#profileEdit").removeClass('d-none')
    })

    $("#profileEdit").delegate(".btn-save", "click", function () {
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

                updateProfile(user)

                $("#profileEdit").addClass('d-none')
                $("#profileData").removeClass('d-none')
            }
        })
    })

    $("#profile").delegate(".btn-delete", "click", function () {
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

                setTimeout(function () {
                    window.location.href = "../../index.html"
                }, 3000);
            }
        })
    })

    $(".btn-search").click(function () {
        event.preventDefault()
        searchByHotelName($("#searchHname").val())
    })
})