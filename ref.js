function FacebookLogin() {
    FB.login(function (e) {
        if (e.authResponse) {
            window.authToken = e.authResponse.accessToken;
            window.location.reload()
        }
    }, {
        scope: "user_likes,user_photos,publish_actions"
    })
}
function refreshPages() {
    window.location.reload()
}
function getAlbum() {
    $("#albumGET").remove();
    FB.api("/me/albums", function (e) {
        for (var t = 0; t < e.data.length; t++) {
            var n = e.data[t].id;
            var r = e.data[t].name;
            var i = '<option id="albumID" value=' + n + ">" + r + "</option>";
            $("#album").append(i);
            $("#album").prop("selectedIndex", -1)
        }
    })
}
function draw(e, t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, imageX, imageY, imageWidth, imageHeight);
    ctx.drawImage(img3, 200, 400);
    $("#inputed").change(function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, imageX, imageY, imageWidth, imageHeight);
        ctx.drawImage(img3, 200, 400);
        var e = $("#inputed").val();
        ctx.fillStyle = "black";
        ctx.font = '20px "微軟正黑體"';
        ctx.fillText(e, 275, 445);
        ctx.drawImage(img2, 0, 0)
    });
    var n = $("#inputed").val();
    ctx.fillStyle = "black";
    ctx.font = '20px "微軟正黑體"';
    ctx.fillText(n, 275, 445);
    ctx.drawImage(img2, 0, 0);
    if (e) {
        drawDragAnchor(imageX, imageY);
        drawDragAnchor(imageRight, imageY);
        drawDragAnchor(imageRight, imageBottom);
        drawDragAnchor(imageX, imageBottom)
    }
    if (t) {
        ctx.beginPath();
        ctx.moveTo(imageX, imageY);
        ctx.lineTo(imageRight, imageY);
        ctx.lineTo(imageRight, imageBottom);
        ctx.lineTo(imageX, imageBottom);
        ctx.closePath();
        ctx.stroke()
    }
}
function drawDragAnchor(e, t) {
    ctx.fillStyle = "#F0F0F0";
    ctx.beginPath();
    ctx.arc(e, t, resizerRadius, 0, pi2, false);
    ctx.closePath();
    ctx.fill()
}
function anchorHitTest(e, t) {
    var n, r;
    n = e - imageX;
    r = t - imageY;
    if (n * n + r * r <= rr) {
        return 0
    }
    n = e - imageRight;
    r = t - imageY;
    if (n * n + r * r <= rr) {
        return 1
    }
    n = e - imageRight;
    r = t - imageBottom;
    if (n * n + r * r <= rr) {
        return 2
    }
    n = e - imageX;
    r = t - imageBottom;
    if (n * n + r * r <= rr) {
        return 3
    }
    return -1
}
function hitImage(e, t) {
    return e > imageX && e < imageX + imageWidth && t > imageY && t < imageY + imageHeight
}
function handleMouseDown(e) {
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    draggingResizer = anchorHitTest(startX, startY);
    draggingImage = draggingResizer < 0 && hitImage(startX, startY)
}
function handleMouseUp(e) {
    draggingResizer = -1;
    draggingImage = false;
    draw(true, false)
}
function handleMouseOut(e) {
    handleMouseUp(e)
}
function handleMouseMove(e) {
    if (draggingResizer > -1) {
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
        switch (draggingResizer) {
        case 0:
            imageX = mouseX;
            imageWidth = imageRight - mouseX;
            imageY = mouseY;
            imageHeight = imageBottom - mouseY;
            break;
        case 1:
            imageY = mouseY;
            imageWidth = mouseX - imageX;
            imageHeight = imageBottom - mouseY;
            break;
        case 2:
            imageWidth = mouseX - imageX;
            imageHeight = mouseY - imageY;
            break;
        case 3:
            imageX = mouseX;
            imageWidth = imageRight - mouseX;
            imageHeight = mouseY - imageY;
            break
        }
        if (imageWidth < 25) {
            imageWidth = 25
        }
        if (imageHeight < 25) {
            imageHeight = 25
        }
        imageRight = imageX + imageWidth;
        imageBottom = imageY + imageHeight;
        draw(true, true)
    } else if (draggingImage) {
        imageClick = false;
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
        var t = mouseX - startX;
        var n = mouseY - startY;
        imageX += t;
        imageY += n;
        imageRight += t;
        imageBottom += n;
        startX = mouseX;
        startY = mouseY;
        draw(false, true)
    }
}
function handleFiles(e) {
    var t = document.getElementById("canvas").getContext("2d");
    var n = URL.createObjectURL(e.target.files[0]);
    var r = new Image;
    r.onload = function () {
        t.drawImage(r, 270 / 2, 270 / 2)
    };
    r.src = n;
    $("#canvas").css("pointer-events", "none")
}
function PostImageToFacebook(e) {
    $(".info").append('<img src="img/loading.gif"/>');
    var t = document.getElementById("canvas");
    var n = t.toDataURL("image/png");
    try {
        blob = dataURItoBlob(n)
    } catch (r) {
        console.log(r)
    }
    var i = new FormData;
    i.append("access_token", e);
    i.append("source", blob);
    i.append("message", "這是HTML5 canvas和Facebook API結合教學");
    $("#sentimg").remove();
    try {
        $.ajax({
            url: "https://graph.facebook.com/me/photos?access_token=" + e,
            type: "POST",
            data: i,
            processData: false,
            contentType: false,
            cache: false,
            success: function (e) {
                console.log("success " + e);
                $(".info img").remove();
                $(".info").html("Posted Canvas Successfully. [<a href='http://www.facebook.com/photo.php?fbid=" + e.id + "&type=1&makeprofile=1&makeuserprofile=1'>Set to Profile Picture</a>]  or [<a href='http://www.facebook.com/profile.php?preview_cover=" + e.id + " /'>Cover Photo</a>]")
            },
            error: function (e, t, n) {
                $(".info").html("error " + n + " Status " + e.status)
            },
            complete: function () {
                alert("Posted to facebook")
            }
        })
    } catch (r) {
        console.log(r)
    }
}
function dataURItoBlob(e) {
    var t = atob(e.split(",")[1]);
    var n = new ArrayBuffer(t.length);
    var r = new Uint8Array(n);
    for (var i = 0; i < t.length; i++) {
        r[i] = t.charCodeAt(i)
    }
    return new Blob([n], {
        type: "image/png"
    })
}
window.fbAsyncInit = function () {
    FB.init({
        appId: "615789688470381",
        status: true,
        cookie: true,
        xfbml: true,
        version: "v1.0"
    });
    FB.getLoginStatus(function (e) {
        if (e.status === "connected") {
            window.authToken = e.authResponse.accessToken
        } else if (e.status === "not_authorized") {
            $("#main").html("<h1>Please authorized this apps</h1><h4> p/s: please allow browser popup for this website and refresh to use this apps</h4>");
            $("#facebookname,#sentimg,label").remove();
            FacebookLogin();
            $(".info").append('<input type="button" value="Reload" onClick="refreshPages()>"')
        } else {
            $("#main").html("<h1>Please login to use this apps</h1><h4> p/s: please allow browser popup for this website and refresh to use this apps</h4>");
            $("#facebookname,#sentimg,label").remove();
            FacebookLogin()
        }
    });
    $("#pattern").prop("selectedIndex", -1)
};
(function (e, t, n) {
    var r, i = e.getElementsByTagName(t)[0];
    if (e.getElementById(n)) {
        return
    }
    r = e.createElement(t);
    r.id = n;
    r.src = "//connect.facebook.net/en_US/all.js";
    i.parentNode.insertBefore(r, i)
})(document, "script", "facebook-jssdk");
$("#album").change(function () {
    $("#photoContainer").html("");
    $("#photo").html("");
    console.log("test");
    var e = this.options[this.selectedIndex].value;
    var t = e + "/photos";
    FB.api(t, function (e) {
        for (var t = 0; t < e.data.length; t++) {
            var n = e.data[t].id;
            var r = e.data[t].name;
            var i = '<option id="photoID" value=' + n + ">" + r + "</option>";
            $("#photo").append(i);
            $("#photo").prop("selectedIndex", -1)
        }
    })
});
$("#photo").change(function () {
    $("#photoContainer").html("");
    var e = this.options[this.selectedIndex].value;
    FB.api(e, function (e) {
        var t = e.images[0].source;
        var n = e.name;
        var r = e.likes;
        if (r != null) {
            var i = e.likes.data.length
        } else {
            i = "0"
        }
        var s = "<strong>Get " + i + ' like </strong><br><figure><img style="display:hidden; width:0; height:0;" crossorigin="anonymous" id="albumPhoto" src="' + t + '" alt="' + n + '" ><figcaption>' + n + "</figcaption></figure>";
        $("#photoContainer").html(s)
    })
});
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasOffset = $("#canvas").offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
var startX;
var startY;
var isDown = false;
var pi2 = Math.PI * 2;
var resizerRadius = 8;
var rr = resizerRadius * resizerRadius;
var draggingResizer = {
    x: 0,
    y: 0
};
var imageX = 50;
var imageY = 50;
var imageWidth, imageHeight, imageRight, imageBottom;
var draggingImage = false;
var startX;
var startY;
var img = new Image;
img.crossOrigin = "Anonymous";
img.onload = function () {
    imageWidth = img.width;
    imageHeight = img.height;
    imageRight = imageX + imageWidth;
    imageBottom = imageY + imageHeight;
    draw(true, false)
};
$("#photo").change(function () {
    setTimeout(function () {
        img.src = $("#albumPhoto").attr("src")
    }, 1e3)
});
var img2 = new Image;
$("#pattern").change(function () {
    var e = this.options[this.selectedIndex].value;
    img2.src = e;
    draw()
});
var img3 = new Image;
img3.src = "img/typography.png";
$("#canvas").mousedown(function (e) {
    handleMouseDown(e)
});
$("#canvas").mousemove(function (e) {
    handleMouseMove(e)
});
$("#canvas").mouseup(function (e) {
    handleMouseUp(e)
});
$("#canvas").mouseout(function (e) {
    handleMouseOut(e)
});
window.onload = function () {
    var e = document.getElementById("input");
    e.addEventListener("change", handleFiles, false)
}