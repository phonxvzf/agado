var hotelManager
var hotelCards

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

window.onload = function () {
    hotelManager = JSON.parse(localStorage.getItem("hotelManager"))
    updateProfile(hotelManager)

    hotelCards = localStorage.getItem("hotelCards")
    if (hotelCards != undefined) {
        $("#hotelCards").html(hotelCards)
    }
}

$(document).ready(function () {

    $(".carousel").carousel({
        pause: false
    })

    $(".btn-logout").click(function () {
        window.location.href = "../../index.html"
    })

    hotelManager = JSON.parse(localStorage.getItem("hoteManager"))

    $("#profileData").delegate(".btn-edit-profile", "click", function () {
        $("#editFname").attr("placeholder", hotelManager.first_name)
        $("#editSname").attr("placeholder", hotelManager.last_name)
        $("#editEmail").attr("placeholder", hotelManager.email)
        $("#editTel").attr("placeholder", hotelManager.phone_num)

        $("#profileData").addClass('d-none')
        $("#profileEdit").removeClass('d-none')
    })

    $("#profileEdit").delegate(".btn-save", "click", function () {
        if ($("#editFname").val())
            hotelManager.first_name = $("#editFname").val();
        if ($("#editSname").val())
            hotelManager.last_name = $("#editSname").val();
        if ($("#editEmail").val())
            hotelManager.email = $("#editEmail").val();
        if ($("#editTel").val())
            hotelManager.phone_num = $("#editTel").val();

        localStorage.setItem("hotelManager", hotelManager)
        $.ajax({
            method: "PUT",
            url: `${window.location.origin}/api/user`,
            headers: {
                'Authorization': `Bearer ${hotelManager.token}`,
            },
            data: {
                username: hotelManager.username,
                first_name: hotelManager.first_name,
                last_name: hotelManager.last_name,
                gender: hotelManager.gender,
                email: hotelManager.email,
                phone_num: hotelManager.phone_num,
                date_of_birth: hotelManager.date_of_birth,
                user_type: hotelManager.user_type
            },
            success: function () {
                $("#modalTitle").html("Save completed");
                $("#modalBody").html("Your profile changed.")
                $("#modalFooter").html(`<button type="button" class="btn btn-dark" data-dismiss="modal">Close</button>`)
                $("#modal").modal("show")

                updateProfile(hotelManager)

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
                'Authorization': `Bearer ${hotelManager.token}`,
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

    $("#hotelCards").delegate(".btn-add-hotel", "click", function () {
        $("#addHotelModal").modal("show")
    })

    $(".btn-add").click(function () {
        if ($("#newHname").val() && $("#newAddr").val() && $("#newProv").val() && $("#newLat").val() &&
            $("#newLng").val()) {

            hotel = {
                name: $("#newHname").val(),
                addr: $("#newAddr").val(),
                prov: $("#newProv").val(),
                lat: $("#newLat").val(),
                long: $("#newLng").val()
            }

            $.ajax({
                method: "POST",
                url: `${window.location.origin}/api/hotel`,
                headers: {
                    'Authorization': `Bearer ${hotelManager.token}`,
                },
                data: hotel,
                success: function () {
                    $("#hotelCards").prepend(`
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

                    localStorage.setItem("hotelCards", $("#hotelCards").html())

                    $("#modalTitle").html("Create completed");
                    $("#modalBody").html("Your hotel will be saved in database")
                    $("#modalFooter").html(`<button type="button" class="btn btn-dark" data-dismiss="modal">Close</button>`)
                    $("#modal").modal("show")
                },
                error: function (err) {
                    console.log(err)
                }
            })
        }
    })
})