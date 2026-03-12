// track.js — geolocalización continua y cálculo de velocidad (km/h)
(() => {
    function getMapboxToken() {
        if (window.APP_CONFIG && window.APP_CONFIG.mapboxAccessToken) return window.APP_CONFIG.mapboxAccessToken;
        return '';
    }

    mapboxgl.accessToken = getMapboxToken();
    if (!mapboxgl.accessToken) {
        document.getElementById('status').innerText = 'No se encontró MAPBOX_ACCESS_TOKEN; revisa .env y php/AppConfig.php';
    }

    const mapa = new mapboxgl.Map({
        container: 'mapa',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-101.3506765, 20.6771539],
        zoom: 15
    });

    let marker = null;
    let watchId = null;
    let lastPos = null; // {lat, lon, ts}

    function haversineMeters(aLat, aLon, bLat, bLon) {
        const R = 6371000; // m
        const toRad = x => x * Math.PI / 180;
        const dLat = toRad(bLat - aLat);
        const dLon = toRad(bLon - aLon);
        const lat1 = toRad(aLat), lat2 = toRad(bLat);
        const sinDLat = Math.sin(dLat / 2), sinDLon = Math.sin(dLon / 2);
        const h = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
        return 2 * R * Math.asin(Math.sqrt(h));
    }

    function setSpeed(kmh) {
        const el = document.getElementById('speedValue');
        el.innerText = `${kmh.toFixed(1)} km/h`;
    }

    function updateCoordinates(lat, lon) {
        document.getElementById('latValue').innerText = lat.toFixed(6);
        document.getElementById('lonValue').innerText = lon.toFixed(6);
    }

    function fetchWeatherData(lat, lon) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&temperature_unit=celsius`)
            .then(res => res.json())
            .then(data => {
                if (data.current) {
                    document.getElementById('tempValue').innerText = `${data.current.temperature_2m}°C`;
                    document.getElementById('humidityValue').innerText = `${data.current.relative_humidity_2m}%`;
                }
            })
            .catch(err => {
                console.error('Error obtener datos de clima:', err);
            });
    }

    function fetchWeightData(lat, lon) {
        fetch(`php/Usuarios/ObtenerPeso.php`)
            .then(res => res.json())
            .then(data => {
                if (data.peso) {
                    document.getElementById('weightValue').innerText = `${data.peso} kg`;
                }
            })
            .catch(err => {
                console.error('Error obtener peso:', err);
            });
    }

    function updatePosition(pos) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const ts = pos.timestamp || Date.now();

        // move map & marker
        mapa.flyTo({ center: [lon, lat], speed: 0.4, zoom: 17 });
        if (!marker) marker = new mapboxgl.Marker().setLngLat([lon, lat]).addTo(mapa);
        else marker.setLngLat([lon, lat]);

        // Mostrar coordenadas exactas
        updateCoordinates(lat, lon);

        // Obtener datos de clima y peso
        if (!lastPos || Math.abs(lat - lastPos.lat) > 0.001 || Math.abs(lon - lastPos.lon) > 0.001) {
            fetchWeatherData(lat, lon);
            fetchWeightData(lat, lon);
        }

        // compute speed
        let speed_m_s = pos.coords.speed; // may be null
        if (speed_m_s === null && lastPos) {
            const dt = (ts - lastPos.ts) / 1000.0; // s
            if (dt > 0) {
                const dist = haversineMeters(lastPos.lat, lastPos.lon, lat, lon);
                speed_m_s = dist / dt;
            }
        }

        if (typeof speed_m_s === 'number' && !isNaN(speed_m_s)) {
            setSpeed(speed_m_s * 3.6);
        } else {
            document.getElementById('status').innerText = 'Esperando datos de velocidad...';
        }

        lastPos = { lat, lon, ts };
    }

    function geoError(err) {
        document.getElementById('status').innerText = `Error geolocalización: ${err.message}`;
    }

    function startWatch() {
        if (!('geolocation' in navigator)) {
            document.getElementById('status').innerText = 'Geolocalización no soportada en este navegador.';
            return;
        }
        document.getElementById('status').innerText = 'Solicitando permiso de ubicación...';
        // trigger permission prompt
        navigator.geolocation.getCurrentPosition(() => {
            document.getElementById('status').innerText = 'Permiso concedido. Iniciando rastreo...';
        }, (e) => {
            document.getElementById('status').innerText = 'Permiso denegado o error: ' + e.message;
        });

        if (watchId !== null) return;
        watchId = navigator.geolocation.watchPosition(updatePosition, geoError, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    }

    function stopWatch() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
            document.getElementById('status').innerText = 'Rastreo detenido.';
            setSpeed(0);
        }
    }

    document.getElementById('startBtn').addEventListener('click', () => { startWatch(); });
    document.getElementById('stopBtn').addEventListener('click', () => { stopWatch(); });

    // auto-start when page loads (optional)
    // startWatch();

})();
