'use strict';

// This is a public, UNPRIVILEGED map-selection helper: it has no credentials
// and cannot write to GitHub. Authentication happens only in the GitHub owner workflow.
export function validCoordinates(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' &&
    Number.isFinite(lat) && Number.isFinite(lon) &&
    lat >= -85 && lat <= 85 && lon >= -180 && lon <= 180;
}
export function formatCoordinates(lat, lon) {
  if (!validCoordinates(lat, lon)) throw new RangeError('Choose a valid map location');
  return lat.toFixed(6) + ', ' + lon.toFixed(6);
}
function start() {
  const mapElement = document.getElementById('owner-location-map');
  if (!mapElement) return;
  const status = document.getElementById('owner-picker-status');
  const coordinates = document.getElementById('owner-pin-coordinates');
  const copy = document.getElementById('owner-copy-coordinates');
  const osmLink = document.getElementById('owner-osm-link');
  if (!window.L || !window.L.map) {
    status.textContent = 'Map could not load. Check your internet connection and refresh.';
    return;
  }
  const map = window.L.map(mapElement, {scrollWheelZoom: true, worldCopyJump: true})
    .setView([-40.9, 174.9], 5);
  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  let pin = null;
  function choose(point) {
    if (!validCoordinates(point.lat, point.lng)) {
      status.textContent = 'That position is outside the available map. Try another spot.';
      return;
    }
    const latitude = Math.round(point.lat * 1000000) / 1000000;
    // Leaflet pans across repeated world copies: normalize longitudes to -180..180.
    const longitude = Math.round((((point.lng + 180) % 360 + 360) % 360 - 180) * 1000000) / 1000000;
    const chosen = window.L.latLng(latitude, longitude);
    if (!pin) {
      pin = window.L.marker(chosen, {draggable: true}).addTo(map);
      pin.on('dragend', () => choose(pin.getLatLng()));
    } else pin.setLatLng(chosen);
    coordinates.value = formatCoordinates(latitude, longitude);
    coordinates.focus();
    coordinates.select();
    copy.disabled = false;
    osmLink.href = 'https://www.openstreetmap.org/?mlat=' + latitude.toFixed(6) +
      '&mlon=' + longitude.toFixed(6) + '#map=17/' + latitude.toFixed(6) + '/' + longitude.toFixed(6);
    osmLink.hidden = false;
    status.textContent = '📍 Pin selected. Copy its coordinates and publish with your owner GitHub account.';
  }
  map.on('click', event => choose(event.latlng));
  copy.addEventListener('click', async () => {
    if (!coordinates.value) return;
    try {
      if (!navigator.clipboard?.writeText) throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(coordinates.value);
      status.textContent = '✅ Copied! Paste into the Coordinates field in your owner publishing workflow.';
    } catch {
      coordinates.focus();
      coordinates.select();
      status.textContent = 'The value is selected. Copy it manually with Ctrl+C and paste into GitHub.';
    }
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
}
