
document.getElementById("BTNLocalizar").addEventListener("click", GetLocation)
document.getElementById("TXTInicio").addEventListener("keyup", (ele) => { ReiniciarTimer(ele) })
document.getElementById("TXTDestino").addEventListener("keyup", (ele) => { ReiniciarTimer(ele) })
//document.getElementById("TXTDestino").addEventListener("keyup", (ele) => { ListaDeSugerencias(ele) })
document.getElementById("TXTInicio").addEventListener("focus", (ele) => { MostrarSugerencias(ele) })
document.getElementById("TXTInicio").addEventListener("focusout", (ele) => { OcultarSugerencias(ele) })
document.getElementById("TXTDestino").addEventListener("focus", (ele) => { MostrarSugerencias(ele) })
document.getElementById("TXTDestino").addEventListener("focusout", (ele) => { OcultarSugerencias(ele) })


function GetLocation() {
    if (!"geolocation" in navigator) {
        return alert("Este navegador o dispositivo no cuenta con la capacidad de geolocalización, intente con otro dispositivo o navegador 🌐");
    }
    const onUbicacionConcedida = ubicacion => {
        latitud = ubicacion.coords.latitude
        longitud = ubicacion.coords.longitude
        Coordenadas = [longitud, latitud]
        CoordenadasALugar().then(res => {
            SetCoordenadas(Coordenadas, "ListaSugerencias")
        })
    }

    const onErrorDeUbicacion = err => {
        alert(err.code)
        alert(err.message)
    }

    const opcionesDeSolicitud = {
        enableHighAccuracy: true, // Alta precisión
        maximumAge: 0, // No queremos caché
        timeout: 5000 // Esperar solo 5 segundos
    };
    // Solicitar

    navigator.geolocation.getCurrentPosition(onUbicacionConcedida, onErrorDeUbicacion, opcionesDeSolicitud);

}

var Coordenadas = [,];
var CoordenadasFin = [,];

var map = null;

function getMapboxToken() {
    if (window.APP_CONFIG && window.APP_CONFIG.mapboxAccessToken) {
        return window.APP_CONFIG.mapboxAccessToken;
    }
    return "";
}

async function MostrarMapa() {
    mapboxgl.accessToken = getMapboxToken();
    if (!mapboxgl.accessToken) {
        alert("No hay token de Mapbox configurado. Revisa MAPBOX_ACCESS_TOKEN en tu archivo .env");
        return;
    }
    map = new mapboxgl.Map({
        container: 'mapa', // container ID
        style: 'mapbox://styles/tabtap/cl5ii882a001d14p6me92ehiv', // style URL
        coordinates: [-101.35067654968455, 20.67715396133386],
        zoom: 12.5, // starting zoom
        projection: 'mercator' // display the map as a 3D globe
    });
    map.addControl(new mapboxgl.NavigationControl());
    map.on('style.load', () => {
        map.setFog({}); // Set the default atmosphere style
    });
    map.panTo([-101.35067654968455, 20.67715396133386]);
}

function TrazarRuta() {
    getRoute().then(() => {
        // Add starting point to the map
        map.addLayer({
            id: 'point',
            type: 'circle',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'circle',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: Coordenadas
                            }
                        }
                    ]
                }
            },
            paint: {
                'circle-radius': 10,
                'circle-color': '#3887be'
            }
        });

        const end = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'circle',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: CoordenadasFin
                    }
                }
            ]
        };
        if (map.getLayer('end')) {
            map.getSource('end').setData(end);
        } else {
            map.addLayer({
                id: 'end',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: CoordenadasFin
                                }
                            }
                        ]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': '#f30'
                }
            });
        }


        /*map.on('click', (event) => {
            const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
            CoordenadasFin = coords;
            const end = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'circle',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: coords
                        }
                    }
                ]
            };
            if (map.getLayer('end')) {
                map.getSource('end').setData(end);
            } else {
                map.addLayer({
                    id: 'end',
                    type: 'circle',
                    source: {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [
                                {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                        type: 'Point',
                                        coordinates: coords
                                    }
                                }
                            ]
                        }
                    },
                    paint: {
                        'circle-radius': 10,
                        'circle-color': '#f30'
                    }
                });
            }
            getRoute();
        });*/
    });
}


let id;
let target;
let options;

var UbicacionActual = [0, 0];

function CalcularDistancia(Inicio, Destino) {
    var DiferenciaX = Destino[0] - Inicio[0]
    var DiferenciaY = Destino[1] - Inicio[1]
    var Distancia = Math.sqrt(Math.pow(DiferenciaX, 2) + Math.pow(DiferenciaY, 2))
    return Distancia
}
var Avisado = false;
var PasosRealizados = 0;
var RecorridoRealizado = false;


function success(pos) {
    const crd = pos.coords;
    UbicacionActual = [crd.longitude, crd.latitude];
    ActualizarEstatus(crd.longitude, crd.latitude);


    //Parse UbicacionActual to Json
    //var UbicacionActualJson = JSON.stringify([UbicacionActual]);

    var Datos = map.getSource('points');
    DatosJson = {
        'type': 'FeatureCollection',
        'features': [
            {
                // feature for Mapbox DC
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': UbicacionActual
                },
                'properties': {
                    'title': 'Tu ubicación'
                }
            },
            {

            }
        ]
    }



    if (PuntosGeoRuta.length > PasosRealizados) {
        var Dif = CalcularDistancia(UbicacionActual, PuntosGeoRuta[PasosRealizados]);
        if (Dif < 0.0006) {
            if (!Avisado) {
                //alert("Aviso de paso");
                Avisado = true;
            }
        }
        if (Dif < 0.0003) {
            Avisado = false;
            PasosRealizados++;
            //alert("Paso realizado");
        }
    } else {
        if (!RecorridoRealizado) {
            alert("Recorrido realizado")
            RecorridoRealizado = true;
            navigator.geolocation.clearWatch(id);
        }
    }


    if (Datos != undefined) {
        map.getSource('points').setData(DatosJson);
        /*map.panTo(UbicacionActual, { duration: 3000 });
        map.jumpTo({
            center: UbicacionActual,
            zoom: 15,
            pitch: 45,
            bearing: 0
        });*/
        /* map.jumpTo({
             center: UbicacionActual,
             zoom: 15,
             pitch: 45,
             bearing: 0
         });*/
        //map.setCenter(UbicacionActual);
    }

    if (CamaraFollowing) {
        CamaraFija(UbicacionActual, PuntosGeoRuta[PasosRealizados]);
    }

    if (target.latitude === crd.latitude && target.longitude === crd.longitude) {

    }
}

function error(err) {
    console.error(`ERROR(${err.code}): ${err.message}`);
}

target = {
    latitude: 0,
    longitude: 0
};

options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};


function IniciarRuta() {
    id = navigator.geolocation.watchPosition(success, error, options);
}

var CamaraFollowing = false;

function ColocarPuntoEn(Coordenaas, ID) {
    const marker = new mapboxgl.Marker(map)
        .setLngLat(Coordenaas)
        .setPopup(new mapboxgl.Popup().setHTML(`${ID}`))
        .addTo(map)

    marker.name = "Taxi-" + ID;
}

function MoverPuntoA(Coordenaas, ID) {
    var Datos = map._markers;
    for (var i = 0; i < Datos.length; i++) {
        if (Datos[i].name == "Taxi-" + ID) {
            Datos[i].setLngLat(Coordenaas);
        }
    }
}

function EliminarPunto(ID) {
    var Datos = map._markers;
    for (var i = 0; i < Datos.length; i++) {
        if (Datos[i].name == "Taxi-" + ID) {
            Datos[i].remove();
        }
    }
}

var PuntoPrueba = [-101.36350819988965, 20.669525101575303]

function ColocarPunto2() {
    map.loadImage(
        'resorces/Ubicacion2.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker2', image);
            // Add a GeoJSON source with 2 points
            map.addSource('TaxiLayer', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            // feature for Mapbox DC
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': PuntoPrueba
                            },
                            'properties': {
                                'title': 'Taxista'
                            }
                        },
                        {

                        }
                    ]
                }
            });

            // Add a symbol layer
            map.addLayer({
                'id': 'TaxiLayer',
                'type': 'symbol',
                'source': 'TaxiLayer',
                'layout': {
                    'icon-image': 'custom-marker2',
                    // get the title name from the source's "title" property
                    'text-field': ['get', 'title'],
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 1.25],
                    'text-anchor': 'top'
                }
            });
        }
    );
}

function ColocarPunto() {

    map.loadImage(
        'resorces/Ubicacion.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
            // Add a GeoJSON source with 2 points
            map.addSource('points', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            // feature for Mapbox DC
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': UbicacionActual
                            },
                            'properties': {
                                'title': 'Tu ubicación'
                            }
                        },
                        {

                        }
                    ]
                }
            });

            // Add a symbol layer
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'points',
                'layout': {
                    'icon-image': 'custom-marker',
                    // get the title name from the source's "title" property
                    'text-field': ['get', 'title'],
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 1.25],
                    'text-anchor': 'top'
                }
            });
        }
    );
    map.on('mousedown', (e) => {
        CamaraFollowing = false;
    })
    map.on('touchmove', (e) => {
        CamaraFollowing = false;
    })
    map.on('click', 'points', function (e) {
        CamaraFollowing = true;

    })

}

function AnguloEntreDosPuntos(Punto1, Punto2) {
    var Angulo = Math.atan2(Punto2[1] - Punto1[1], Punto2[0] - Punto1[0]) * (180 / Math.PI);

    if (Angulo < 0) {
        Angulo = Angulo + 360;
    }
    Angulo = Angulo - 90;

    return -Angulo;
}

function Rotacion(Rotar) {
    map.rotateTo(Rotar);
}

function CamaraFija(Coordernadas, CoordenadasDestino) {

    var Rotacion = AnguloEntreDosPuntos(Coordernadas, CoordenadasDestino);
    map.jumpTo({
        center: Coordernadas,
        zoom: 16,
        pitch: 45,
    });
    map.rotateTo(Rotacion);
}

function CamaraLibre() {

}


var PuntosGeoRuta = [];
// create a function to make a directions request
async function getRoute() {
    PuntosGeoRuta = [];
    const query = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${Coordenadas[0]},${Coordenadas[1]};${CoordenadasFin[0]},${CoordenadasFin[1]}?steps=true&geometries=geojson&language=es&access_token=${mapboxgl.accessToken}`, { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
        map.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'bevel',
                'line-cap': 'butt'
            },
            paint: {
                'line-color': '#141414',
                'line-width': 5,
                'line-opacity': 0.60
            }
        });
    }


    // add turn instructions here at the end
    var DistanciaTotal = 0;
    var TiempoTotal = 0;
    const steps = data.legs[0].steps;
    for (var i = 0; steps.length > i; i++) {
        DistanciaTotal += steps[i].distance;
        TiempoTotal += steps[i].duration;
        //console.log("Indicacion " + (i + 1) + ": " + steps[i].maneuver.instruction)

        PuntosGeoRuta.push(steps[i].geometry.coordinates[steps[i].geometry.coordinates.length - 1]);
        //ColocarPuntoEn(steps[i].geometry.coordinates[steps[i].geometry.coordinates.length - 1]);
    }

    ColocarPunto()
    IniciarRuta()
}

/* Ejemplo de endpoint:
https://api.mapbox.com/directions/v5/mapbox/driving/origen;destino?alternatives=true&geometries=geojson&language=es&overview=simplified&steps=true&access_token=TOKEN */

async function CoordenadasALugar() {
    var cons = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + Coordenadas + ".json?access_token=" + encodeURIComponent(getMapboxToken());
    const Consulta = await fetch(cons, { method: "GET" })
    const Respuesta = await Consulta.json();
    var Calle = Respuesta.features[0].place_name;
    document.getElementById("TXTInicio").value = Calle
}

async function ListaDeSugerencias(ele) {
    switch (ele.target.id) {
        case "TXTInicio":
            document.getElementById("ListaSugerencias").style.display = "";
            document.getElementById("Loading").style.display = "none";
            var Busqueda = document.getElementById("TXTInicio").value
            break
        case "TXTDestino":
            document.getElementById("ListaSugerencias2").style.display = "";
            document.getElementById("Loading2").style.display = "none";
            var Busqueda = document.getElementById("TXTDestino").value
            break
    }

    Busqueda = Busqueda.replaceAll(" ", "%20")
    var ApiSearch = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + Busqueda + ".json?country=mx&limit=3&proximity=ip&language=es&access_token=" + encodeURIComponent(getMapboxToken())
    const Consulta = await fetch(ApiSearch, { method: "GET" })
    const Respuesta = await Consulta.json();
    CrearLista(Respuesta, ele)
}

function CrearLista(Respuesta, El) {
    MostrarSugerencias(El)
    var Origen = El.target.id
    switch (El.target.id) {
        case "TXTInicio":
            El = "ListaSugerencias";
            break;
        case "TXTDestino":
            El = "ListaSugerencias2";
            break;
    }

    document.getElementById(El).innerHTML = "";
    var Sugerencias = Respuesta.features;

    var DivListGroup = document.createElement("div")
    DivListGroup.classList = "list-group"
    DivListGroup.id = "ListadoSugerencias"

    for (var i = 0; Sugerencias.length > i; i++) {
        DivListGroup.appendChild(GenerarElemento(Sugerencias[i], Origen, i, El))
    }
    document.getElementById(El).appendChild(DivListGroup)
}
function GenerarElemento(Datos, Origen, i, El) {
    var NombreCompleto = Datos.place_name_es
    var NombreLugar = Datos.text_es
    var Coords = Datos.geometry.coordinates

    var aElemento = document.createElement("a")
    aElemento.classList = "list-group-item list-group-item-action"
    aElemento.href = "#"
    aElemento.id = "Sugerencia" + i + "-" + Origen
    aElemento.addEventListener("click", () => {
        SetCoordenadas(Coords, El)
        document.getElementById(Origen).value = NombreCompleto
    })
    var pElemento = document.createElement("p")
    pElemento.classList = "mb-1"
    pElemento.innerHTML = '<i class="fa-solid fa-location-dot"></i> <b>' + NombreLugar + "</b>, <i>" + NombreCompleto + "</i>"
    var smallE = document.createElement("small")
    smallE.classList = "text-muted"
    smallE.innerText = ""

    aElemento.appendChild(pElemento)
    aElemento.appendChild(smallE)
    return aElemento
}
function SetCoordenadas(Cord, Elemento) {
    switch (Elemento) {
        case "ListaSugerencias":
            document.getElementById("ListaSugerencias").innerHTML = "";
            Coordenadas = Cord
            break;
        case "ListaSugerencias2":
            document.getElementById("ListaSugerencias2").innerHTML = "";
            CoordenadasFin = Cord
            break;
    }
    TrazarRecorrido()
}
function OcultarSugerencias(ele) {
    switch (ele.target.id) {
        case "TXTInicio":
            $("#ListaSugerencias").fadeOut("fast");
            break
        case "TXTDestino":
            //document.getElementById("ListaSugerencias2").style.display = "none"
            $("#ListaSugerencias2").fadeOut("fast");
            break
    }
}
function MostrarSugerencias(ele) {
    switch (ele.target.id) {
        case "TXTInicio":
            //document.getElementById("ListaSugerencias").style.display = ""
            $("#ListaSugerencias").fadeIn("fast");
            break
        case "TXTDestino":
            //document.getElementById("ListaSugerencias2").style.display = ""
            $("#ListaSugerencias2").fadeIn("fast");
            break
    }
}

function TrazarRecorrido() {
    if (document.getElementById("TXTInicio").value != "" && document.getElementById("TXTDestino").value != "") {
        if (Coordenadas.length >= 2 && CoordenadasFin.length >= 2) {
            TrazarRuta()
        }
    }
}

MostrarMapa()
//Privada la llave de mapbox
//

function PosicionActual() {
    if (!"geolocation" in navigator) {
        return alert("Este navegador o dispositivo no cuenta con la capacidad de geolocalización, intente con otro dispositivo o navegador 🌐");
    }
    const onUbicacionConcedida = ubicacion => {
        latitud = ubicacion.coords.latitude
        longitud = ubicacion.coords.longitude
    }

    const onErrorDeUbicacion = err => {
        alert(err.code)
        alert(err.message)
    }

    const opcionesDeSolicitud = {
        enableHighAccuracy: true, // Alta precisión
        maximumAge: 0, // No queremos caché
        timeout: 5000 // Esperar solo 5 segundos
    };
    // Solicitar
    navigator.geolocation.watchPosition(onUbicacionConcedida, onErrorDeUbicacion, opcionesDeSolicitud);
}


var timerId = "";
function ReiniciarTimer(Element) {
    clearTimeout(timerId);  //Reinicia el timer
    if (Element.target.id == "TXTDestino") {
        document.getElementById("Loading2").style.display = "";  //Oculta sugerencias y muestra loading
        document.getElementById("ListaSugerencias2").style.display = "none";
    } else {
        document.getElementById("Loading").style.display = "";  //Oculta sugerencias y muestra loading
        document.getElementById("ListaSugerencias").style.display = "none";
    }
    EsperarPorRespuesta(Element); //Inicializa un nuevo timer
}
function EsperarPorRespuesta(Element) {
    timerId = setTimeout(ListaDeSugerencias, 1500, Element);    //Inicia un nuevo timer
}


//cuando el documento html este listo ejecuta la funcion
//jquery for document ready
$(document).ready(async function () {
    if (window.localStorage.getItem("TokenIS") != null) {
        var Content = new FormData();
        Content.append("Token", window.localStorage.getItem("TokenIS"));
        Content.append("User", window.localStorage.getItem("UserIS"));
        const Consulta = await fetch("php/Usuarios/ConfirmarSesion.php", { method: "POST", body: Content });
        const Respuesta = await Consulta.text();
        console.log(Respuesta);
        if (Respuesta == "1") {
            document.getElementById("UserData").style.display = "";
            document.getElementById("NombreNavBar").innerHTML = window.localStorage.getItem("UserIS");
            document.getElementById("IniciarSesionMenu").style.display = "none";
        } else {
            document.getElementById("UserData").style.display = "none";
            document.getElementById("IniciarSesionMenu").style.display = "";
        }
    } else {

    }
})




async function MandarSesion() {
    var Content = new FormData();
    Content.append("Token", window.localStorage.getItem("TokenIS"));
    Content.append("User", window.localStorage.getItem("UserIS"));
    const Consulta = await fetch("php/Usuarios/ConfirmarSesion.php", { method: "POST", body: Content });
    const Respuesta = await Consulta.text();
    console.log(Respuesta);
}

var ListaUsuarios = [];

var wsUri = "ws://localhost:9000/MapBox/php/Sockets/server.php";
websocket = new WebSocket(wsUri);
websocket.onmessage = function (ev) {
    if (ev.data != "") {
        var response = JSON.parse(ev.data); //PHP sends Json data
        var res_type = response.type; //message type
        var user_message = response.message; //message text
        var user_name = response.name; //user name
        var Accion = response.Accion; //user name
        var Usuario = response.User; //user name

        var Latitud = response.Latitud; //Latitud
        var Longitud = response.Longitud; //Longitud
        var Tokenss = response.Token; //Token
        var Id = response.Id;

        Id = Id.split("#");

        if (Accion == "Conexion") {
            console.log("Hacer ping: " + Id[1]);
            ListaUsuarios.push(Id[1]);
            ColocarPuntoEn([0, 0], Id[1])
        }

        if (Accion == "Actualizacion") {
            var Marcadores = map._markers;
            var Existe = true;
            for (var i = 0; ListaUsuarios.length > i; i++) {
                if (ListaUsuarios[i] == Id[1]) {
                    Existe = false;
                }
            }
            if (Existe) {
                ListaUsuarios.push(Id[1]);
                ColocarPuntoEn([0, 0], Id[1])
            }

            //console.log("[" + res_type + "] (" + Accion + ") " + Usuario + ": " + user_message);
            console.log(Id[1] + " - [" + Latitud + "] [" + Longitud + "] - " + Accion + "");
            MoverPuntoA([Longitud, Latitud], Id[1])
        }
        if (Accion == "Desconexion") {
            console.log("Eliminar ping: " + Id[1])
            EliminarPunto(parseInt(Id[1]))
            ListaUsuarios.splice(ListaUsuarios.indexOf(Id[1]), 1);
        }


        if (res_type == "") {

        }
    }
};
websocket.onerror = function (ev) {
};
websocket.onclose = function (ev) {
};



function send_message(Usuario, Mensaje) {
    var message_input = Mensaje; //user message text
    var name_input = Usuario; //user name

    //prepare json data
    var msg = {
        message: message_input,
        name: name_input,
        color: "#FFFFFF",
        User: window.localStorage.getItem("UserIS"),
    };
    //convert and send data to server
    websocket.send(JSON.stringify(msg));
}

function ActualizarEstatus(Longitud, Latitud) {
    var msg = {
        message: "Actualizando ubicación",
        Accion: "Actualizacion",
        name: "Nombre",
        color: "#FFFFFF",
        Longitud: Longitud,
        Latitud: Latitud,
        Token: window.localStorage.getItem("TokenIS"),
        User: window.localStorage.getItem("UserIS")
    };

    websocket.send(JSON.stringify(msg));
}


async function CerrarSesion() {
    window.localStorage.removeItem("TokenIS");
    window.localStorage.removeItem("UserIS");
    const Consulta = await fetch("php/Usuarios/CerrarSesion.php", { method: "GET" });
    const Respuesta = await Consulta.text();
    window.location.href = "index.html";
}

function ResetSearch() {
    PuntosGeoRuta = [];
    Coordenadas = [];
    CoordenadasFin = [];
    RecorridoRealizado = false;
}