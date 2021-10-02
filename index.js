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
        result.routes[0].legs[0].steps.forEach(step => {
          let node = document.createElement('LI');
          node.innerHTML = step.instructions;
          ul.appendChild(node);
        });
      }
    });
  });
}
