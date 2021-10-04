/* Google Maps API */
let initialized;
let map;
let mapElement = document.getElementById('map');

var directionsService;
var directionsRenderer;


function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  let mapOptions = {
      zoom: 10,
      center: {lat: 45.3743085028, lng: -71.9232596403}
    };
  map = new google.maps.Map(mapElement, mapOptions);
  directionsRenderer.setMap(map);

  initialized = "true";
}

function submitGoogleMaps() {
    let orig = document.getElementById("directionsStart").value;
    let dest = document.getElementById("directionsEnd").value;
    let mode = document.getElementById("directionsMode").value;
    console.log(orig);
    console.log(dest);

    calcRoute(orig, dest, mode);
}

function extractPlaceId(placeString) {
  return new Promise(async (resolve, reject) => {
    // Get geocoder response from place string
    geocoder = new google.maps.Geocoder();
    response = await geocoder.geocode({'address': placeString});

    // If the geocoder request failed, reject promise
    if (!response) reject();

    // Return the lat & long from the geocoder response
    resolve(response.results[0].geometry.location);
  });
}

function calcRoute(orig, dest, mode) {
  if (!initialized) return;

  origPromise = extractPlaceId(orig);
  destPromise = extractPlaceId(dest);
  Promise.all([origPromise, destPromise]).then(([origLoc, destLoc]) => {
    let origLat = origLoc.lat();
    let origLng = origLoc.lng();
    let destLat = destLoc.lat();
    let destLng = destLoc.lng();

    var request = {
      origin: {lat: origLat, lng: origLng},
      destination: {lat: destLat, lng: destLng},
      travelMode: mode.toUpperCase()
    };

    directionsService.route(request, (result, status) => {
      if (status == 'OK') {
        directionsRenderer.setDirections(result);

        let ul = document.getElementById('directionSteps');

        // Clearing des steps précédents
        ul.innerHTML = '';

        // Ajout des routes dans la liste
        result.routes[0].legs[0].steps.forEach(step => {
          let node = document.createElement('LI');
          node.innerHTML = step.instructions;
          ul.appendChild(node);
        });
      }
    });
  });
}

function enterApiKey() {
    let input = document.getElementById('apiKey');
    let key = input.value;
    console.log("Entered API Key: " + key);

    if (key) {
        input.setAttribute('class', "directionsEntry");
        key = "https://maps.googleapis.com/maps/api/js?key=" + key + "&callback=initMap&v=weekly";
        var someScript = document.getElementById("initScript")
        if (!someScript) {
            let initScript = document.createElement("script");
            initScript.setAttribute('id', "initScript");
            callApiKey(key, initScript);
        }
        // Check if the key has changed 
        else {
            if (someScript.getAttribute('src') != key)
            {
                callApiKey(key, someScript);
            }
        }
    }
}
function callApiKey(key, script) {
    script.setAttribute('src', key);
    document.body.appendChild(script);
}