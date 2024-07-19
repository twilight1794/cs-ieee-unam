"use strict"

window.addEventListener('DOMContentLoaded', (event) => {
    /* Leaflet */
    var maps = document.getElementsByClassName("mapa");
    if (maps.length){
        var style = document.createElement("link");
        style.setAttribute("href", "https://unpkg.com/leaflet@1.9.3/dist/leaflet.css");
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("integrity", "sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI=");
        style.setAttribute("crossorigin", "");
        var script = document.createElement("script");
        script.setAttribute("src", "https://unpkg.com/leaflet@1.9.3/dist/leaflet.js");
        script.setAttribute("async", "async");
        script.setAttribute("integrity", "sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM=");
        script.setAttribute("crossorigin", "");
        script.addEventListener('load', (event2) => {
            for (let e of maps){
                var map = L.map(e.id).setView([e.dataset.x, e.dataset.y], e.dataset.zoom);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);
                L.marker([e.dataset.x, e.dataset.y]).addTo(map).bindPopup(e.title).openPopup();
            }
        });
        document.head.appendChild(style);
        document.body.appendChild(script);
    }
    /* Facebook */
    var fb = document.getElementsByClassName("twitter-tweet");
    if (fb.length){
        var script = document.createElement("script");
        script.setAttribute("src", "https://platform.twitter.com/widgets.js");
        script.setAttribute("async", "async");
        script.setAttribute("charset", "utf-8");
        document.body.appendChild(script);
    }
    /* Instagram */
    var ig = document.getElementsByClassName("instagram-media");
    if (ig.length){
        var script = document.createElement("script");
        script.setAttribute("src", "//www.instagram.com/embed.js");
        script.setAttribute("async", "async");
        document.body.appendChild(script);
    }
    /* Búsqueda */
    const fechaAct = Date.now();
    const fechaAnt = Date.parse(sessionStorage.getItem("fechaMapa"));
    const fechaDiff = Math.abs(fechaAnt - fechaAct) / 36e5;
    if (!fechaDiff || fechaDiff > 2) {
        localStorage.removeItem("fechaMapa");
        localStorage.removeItem("XMLMapa");
        const rlist = new XMLHttpRequest();
        rlist.addEventListener("load", (event2) => {
            window.sitemap = rlist.responseXML;
            const ser = new XMLSerializer();
            localStorage.setItem("XMLMapa", ser.serializeToString(window.sitemap));
            localStorage.setItem("fechaMapa", fechaAct);
            /* Crear lista */
            var dlgBusq = document.getElementById("cuadroBusq");
            var dlgList = dlgBusq.getElementsByTagName("ul")[0];
            for (let i of window.sitemap.documentElement.children){
                var li = document.createElement("li");
                li.setAttribute("typeof", "https://schema.org/WebPage");
                var str = `<a property="http://purl.org/dc/terms/title" href="${i.getElementsByTagName("loc")[0].textContent}">${i.getElementsByTagNameNS("http://purl.org/dc/terms/", "title")[0].textContent}</a>`;
                str += `<a property="http://schema.org/url" href="${i.getElementsByTagName("loc")[0].textContent}">${i.getElementsByTagName("loc")[0].textContent.replace(window.location.origin, "")}</a>`;
                str += "<div>";
                var tmp = i.getElementsByTagNameNS("http://purl.org/dc/terms/", "creator");
                if (tmp.length) { str += `<span>Por <span property="http://purl.org/dc/terms/creator">${tmp[0].textContent.trim()}</span>. </span>`; }
                var tmp = i.getElementsByTagNameNS("http://purl.org/dc/terms/", "created");
                if (tmp.length) {
                    var d = new Date(tmp[0].textContent.trim().replace(" ","T").replace(" ", ""));
                    str += `<span>Creado el <span property="http://purl.org/dc/terms/created">${d.toLocaleDateString()}</span>. </span>`;
                }
                var tmp = i.getElementsByTagName("lastmod");
                if (tmp.length && tmp[0].textContent.trim()) {
                    var d = new Date(tmp[0].textContent.trim().replace(" ","T").replace(" ", ""));
                    str += `<span>Modificado por última vez el <span property="http://purl.org/dc/terms/date">${d.toLocaleDateString()}</span>. </span>`;
                }
                li.innerHTML = str + "</div>";
                li.hidden = true;
                dlgList.appendChild(li);
            }
            /* Colocar botón de búsqueda */
            var btnBusq = document.createElement("button");
            btnBusq.textContent = "🔎︎";
            btnBusq.title = "Buscar";
            btnBusq.id = "buscar";
 
            btnBusq.addEventListener("click", (event2) => {
                dlgBusq.showModal();
                dlgBusq.getElementsByTagName("input")[0].focus();
            });
            dlgBusq.children[0].children[1].addEventListener("input", (event3) => {
                var todos = Array.from(document.querySelectorAll("#cuadroBusq [typeof]"));
                var val = event3.target.value;
                for (let i of todos){
                    if (val){
                        var vered = false;
                        if (i.querySelector("[property*=title]").textContent.toLocaleLowerCase().search(val.toLocaleLowerCase()) != -1){ vered = true; }
                        if (i.querySelector("[property*='/url']").textContent.toLocaleLowerCase().search(val.toLocaleLowerCase()) != -1){ vered = true; }
                        i.hidden = !vered;
                    } else {
                        i.hidden = false;
                    }
                }
            });
            dlgBusq.addEventListener("click", (event2) => {
                if (event2.target.id == "cuadroBusq"){ event2.target.close(); }
            });
            dlgBusq.children[0].children[0].addEventListener("click", (event2) => { event2.target.parentNode.parentNode.close(); });
            document.querySelector("body header label").after(btnBusq);
        });
        rlist.open("GET", "/sitemap.xml");
        rlist.send();
    }
});