
export function isEmpty(obj) {
    for (var k in obj) {
        return false;
    }
    return true;
}


export function getCookie(name) {
    // Taken from https://www.quirksmode.org/js/cookies.html
    // Maybe just replace with js-cookie?
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0) ===' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}


export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let expires_dt = new Date();
        let days2ms = days * 24 * 60 * 60 * 1000;
        expires_dt.setTime(expires_dt.getTime() + days2ms);
        expires = "; expires=" + expires_dt.toUTCString();
    }

    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}