// Theses variables will be used when Door button is pressed
var current_refresh_token = null;

/* Allow to get a parameter in the URL ex: ?foo=bar */
function getURLParameter(name) {
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
}

$(document).ready(function() {
    var refresh_token = localStorage.getItem('refresh_token');
    
    /* First we try to fetch the refresh_token in the local storage */
    if (null !== refresh_token) {
        current_refresh_token = refresh_token;
        $("#openDoor").removeClass("disabled").addClass("btn-success");
    } else {
        /* Otherwise, we are maybe in the authentication process and the server gaves us the refresh token */
        refresh_token = getURLParameter("refresh_token");
        if ("null" !== refresh_token) {
            current_refresh_token = refresh_token;
            $("#openDoor").removeClass("disabled").addClass("btn-success");
        }
    }
});

$("#openDoor").on("click", function() {
    var refresh_token = current_refresh_token;
    var data = {};
    
    if (null !== refresh_token) {
        data.refresh_token = refresh_token;
    } else {
        return;
    }
    
    $.ajax({
        type: 'POST',
        url: '/api/opendoor',
        success: function(result) {
            $("#status").html(result.message);
            /* If the app tell us that the authentication is good, we set the token inside the local storage of the user */
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
    localStorage.removeItem('refresh_token');
    $("#openDoor").addClass("disabled").removeClass("btn-success");
});
