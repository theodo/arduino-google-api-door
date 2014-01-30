// Theses variables will be used when Door button is pressed
var current_refresh_token = null;

function getURLParameter(name) {
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
}

$(document).ready(function() {
    var refresh_token = localStorage.getItem('refresh_token');
    
    if (null !== refresh_token) {
        current_refresh_token = refresh_token;
        $("#openDoor").removeClass("disabled");
    } else {
        refresh_token = getURLParameter("refresh_token");
        if ("null" !== refresh_token) {
            current_refresh_token = refresh_token;
            $("#openDoor").removeClass("disabled");
        }
    }
});

$("#openDoor").on("click", function() {
    var refresh_token = current_refresh_token;
    var data = {};
    
    if (null !== refresh_token) {
        data.auth_type = "googleoauth";
        data.refresh_token = refresh_token;
    } else {
        return;
    }
    
    $.ajax({
        type: 'POST',
        url: '/api/opendoor',
        success: function(result) {
            $("#status").html(result.message);
            if (result.status == 0) {
                localStorage.setItem('refresh_token', refresh_token);
            }
        },
        data: data
    });
});

$("#reinitialize").on("click", function() {
    // Remove actual used variables
    current_refresh_token = null;
    // Clear local storage
    localStorage.removeItem('refresh_token');
    $("#openDoor").addClass("disabled");
});