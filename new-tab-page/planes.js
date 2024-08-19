// get aircraft closest to user
async function getAircraft(radius) {

    // get user location
    let location = {};

    try {
        const position = await getCurrentPosition();

        if (position) {
            location.lat = position.coords.latitude;
            location.lon = position.coords.longitude;
        } else {
            // default to lat and lon of London, UK
            location.lat = 51.5072;
            location.lon = 0.1276
        }
    } catch {
        // default to lat and lon of London, UK
        location.lat = 51.5072;
        location.lon = 0.1276
    }

    // fetch aircraft in vincinity from https://api.airplanes.live/
    data = await fetch(`https://api.airplanes.live/v2/point/${location.lat}/${location.lon}/${radius}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            } else {
                return response.json();
            }
        })

    const ac = data.ac;

    // return if aircraft not found
    if (!ac || ac.length == 0) {
        return;
    }

    // find closest aircraft
    let minDistance = Infinity;
    let closest;

    for (let i = 0; i < ac.length; i++) {
        let horizontalDistance = haversineDistance(location.lat, location.lon, ac[i].lat, ac[i].lon);
        let verticalDistance = Number(ac[i].alt_baro) * 0.3048;

        let distance = Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2));

        if (distance < minDistance) {
            closest = ac[i];
            minDistance = distance;
        }
    }

    return closest;
   
}

// fetch navigator information promise
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            return undefined;
        }
    });
}

// calculate haversine distance for best image finder
function haversineDistance(lat1, lon1, lat2, lon2) {
    const r = 6.371e6;
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    // solve for d = 2rarcsin(a)
    const a = Math.sqrt(
        (1 - Math.cos(degreesToRadians(dLat)) + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * (1 - Math.cos(degreesToRadians(dLon)))) / 2
    )

    return d = 2*r*Math.asin(a);
}

// convert degrees to radians
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// render closes aircraft on page
async function renderAircraft() {
    const aircraft = await getAircraft(5);
    const container = document.getElementById('container')
    const callsign = document.getElementById('callsign');
    const description = document.getElementById('description');

    // prevent change if aircraft is the same
    const isSame = aircraft && callsign.innerHTML && callsign.innerHTML.includes(aircraft.flight.trim());

    if (!isSame) {
        container.classList.add('planes__container--fade-out')
        container.classList.remove('planes__container--fade-in')
    }


    setTimeout(() => {

        if (aircraft == undefined) {
            callsign.innerHTML = '';
            description.innerHTML = '';
        } else {
            callsign.innerHTML = `Your nearest aircraft, <a class='planes__link' href='${'https://www.flightradar24.com/' + aircraft.flight.trim()}'>${ aircraft.flight.trim()}</a>.`;
            if (aircraft.ownOp) {
                description.innerHTML = `${aircraft.ownOp} ${aircraft.desc}. Currently at ${aircraft.alt_baro}ft, heading ${String(aircraft.mag_heading.toFixed(0)).padStart(3, '0')}&deg.`
            } else {
                description.innerHTML = `Type ${aircraft.desc}. Currently at ${aircraft.alt_baro}ft, heading ${String(aircraft.mag_heading.toFixed(0)).padStart(3, '0')}&deg.`
            }
            
            if (!isSame) {
                container.classList.add('planes__container--fade-in')
            }
        }

    }, 1000)

}

renderAircraft();

setInterval(renderAircraft, 5000);
