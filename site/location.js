'use strict';

// The public location picker never saves or transmits a pin automatically.
// Emailing a selected pin requires the visitor to tap the email button and send.
export const SUPPORT_EMAIL = 'findthecashnz@gmail.com';

export function isValidPoint(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' &&
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function mapLink(lat, lng) {
  if (!isValidPoint(lat, lng)) throw new RangeError('Choose a valid location');
  const a = lat.toFixed(5), b = lng.toFixed(5);
  return `https://www.openstreetmap.org/?mlat=${a}&mlon=${b}#map=15/${a}/${b}`;
}

export function locationEmail(lat, lng) {
  if (!isValidPoint(lat, lng)) throw new RangeError('Choose a valid location');
  const subject = 'Find The Cash NZ - My selected location';
  const body = `Kia ora Find The Cash NZ,

I selected this location on the map to show where I am:

Latitude: ${lat.toFixed(5)}
Longitude: ${lng.toFixed(5)}
Map: ${mapLink(lat, lng)}

I chose to share this location. Please do not post my exact location publicly without asking me.

Thanks!`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function startLocationPicker() {
  const $ = id => document.getElementById(id);
  const status = $('map-status');
  const email = $('email-location');
  const copy = $('copy-location');
  const clear = $('clear-location');
  const centre = $('centre-location');
  const coordinates = $('selected-coordinates');
  const view = $('view-location');
  const fallback = $('copy-fallback');
  let selected = null, marker = null;

  if (!window.L || !window.L.map) {
    status.textContent = 'Map could not load. Please connect to the internet and refresh.';
    centre.disabled = true;
    return;
  }

  const map = window.L.map('location-map', {scrollWheelZoom: false})
    .setView([-40.9, 174.9], 5);
  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  function setLocation(point) {
    if (!isValidPoint(point.lat, point.lng)) return;
    selected = {lat: point.lat, lng: point.lng};
    if (!marker) {
      marker = window.L.marker([selected.lat, selected.lng], {draggable: true}).addTo(map);
      marker.on('dragend', () => setLocation(marker.getLatLng()));
    } else {
      marker.setLatLng([selected.lat, selected.lng]);
    }
    const label = `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`;
    coordinates.textContent = '📍 ' + label;
    status.textContent = 'Pin selected. Drag it to adjust, then choose what to share.';
    email.disabled = false;
    copy.disabled = false;
    clear.disabled = false;
    view.href = mapLink(selected.lat, selected.lng);
    view.hidden = false;
    fallback.hidden = true;
  }

  map.on('click', event => setLocation(event.latlng));
  centre.addEventListener('click', () => setLocation(map.getCenter()));
  clear.addEventListener('click', () => {
    selected = null;
    if (marker) {map.removeLayer(marker); marker = null;}
    coordinates.textContent = 'No location selected yet.';
    status.textContent = 'Tap anywhere on the map to place your pin.';
    email.disabled = true;
    copy.disabled = true;
    clear.disabled = true;
    view.hidden = true;
    fallback.hidden = true;
  });
  email.addEventListener('click', () => {
    if (selected) window.location.href = locationEmail(selected.lat, selected.lng);
  });
  copy.addEventListener('click', async () => {
    if (!selected) return;
    const url = mapLink(selected.lat, selected.lng);
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      status.textContent = 'Map link copied. You decide who to share it with.';
    } catch {
      fallback.value = url;
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
      status.textContent = 'Copy the highlighted link to share it yourself.';
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLocationPicker, {once: true});
  } else {
    startLocationPicker();
  }
}
