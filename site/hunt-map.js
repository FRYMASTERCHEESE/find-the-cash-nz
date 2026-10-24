'use strict';

// Public READ-ONLY town display. Only the authenticated owner publishing workflow writes town pins.
// No visitor can set pins and no device location or GPS is ever requested.
export function isVisibleTownPin(data, now = Date.now()) {
  if (!data || typeof data !== 'object' || data.active !== true ||
      data.source !== 'owner_published' || data.accuracy !== 'approximate_town_centre' ||
      typeof data.town !== 'string' || data.town.length < 2 || data.town.length > 70 ||
      typeof data.lat !== 'number' || typeof data.lon !== 'number' ||
      !Number.isFinite(data.lat) || !Number.isFinite(data.lon) ||
      data.lat < -48.5 || data.lat > -33 || data.lon < 165 || data.lon > 180 ||
      typeof data.expires_at !== 'string') return false;
  const expiry = Date.parse(data.expires_at);
  return Number.isFinite(expiry) && expiry > now;
}

export function embedUrl(data) {
  const active = isVisibleTownPin(data);
  const lat = active ? data.lat : -40.9;
  const lon = active ? data.lon : 173.5;
  const latitudeSpan = active ? 0.09 : 7.2;
  const longitudeSpan = active ? 0.12 : 6;
  const bounds = [lon - longitudeSpan, lat - latitudeSpan,
                  lon + longitudeSpan, lat + latitudeSpan].map(n => n.toFixed(5)).join(',');
  const params = new URLSearchParams({bbox: bounds, layer: 'mapnik'});
  if (active) params.set('marker', String(lat) + ',' + String(lon));
  return 'https://www.openstreetmap.org/export/embed.html?' + params.toString();
}

export function fullMapUrl(data) {
  if (!isVisibleTownPin(data)) return 'https://www.openstreetmap.org/';
  const lat = data.lat.toFixed(5), lon = data.lon.toFixed(5);
  return 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '#map=12/' + lat + '/' + lon;
}

function formatExpiry(iso) {
  try {
    return new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland', dateStyle: 'medium', timeStyle: 'short'
    }).format(new Date(iso));
  } catch { return 'soon'; }
}

function start() {
  const homeStatus = document.getElementById('home-town-status');
  const homePanel = document.getElementById('home-town-map-panel');
  const homeFrame = document.getElementById('home-town-map-frame');
  const pageStatus = document.getElementById('town-map-status');
  const pageTown = document.getElementById('town-map-label');
  const pageExpiry = document.getElementById('town-map-expiry');
  const pageFrame = document.getElementById('town-map-frame');
  const fullLink = document.getElementById('town-map-full-link');
  if (!homeStatus && !pageStatus) return;

  let lastFrameUrl = null;
  function draw(data) {
    const active = isVisibleTownPin(data);
    const name = active ? data.town : '';
    if (homeStatus) {
      homeStatus.textContent = active
        ? '📍 Owner-pinned town: ' + name + ', New Zealand'
        : 'No current town pinned by Find The Cash NZ.';
      if (homePanel) homePanel.hidden = !active;
      if (homeFrame && active) {
        const url = embedUrl(data);
        if (homeFrame.src !== url) homeFrame.src = url;
      }
    }
    if (pageStatus) {
      pageStatus.textContent = active
        ? '📍 Find The Cash NZ has pinned ' + name + ', New Zealand.'
        : 'No town is currently pinned by the owner.';
      if (pageTown) pageTown.textContent = active ? name + ', NZ' : 'Waiting for the next owner pin 💚';
      if (pageExpiry) pageExpiry.textContent = active
        ? 'This owner-posted town pin automatically expires on ' + formatExpiry(data.expires_at) + ' (NZ time).'
        : 'Only the owner can publish a town; the map never reveals live GPS or a cash location.';
      if (fullLink) {
        fullLink.hidden = !active;
        if (active) fullLink.href = fullMapUrl(data);
      }
      if (pageFrame) {
        const url = embedUrl(active ? data : null);
        if (url !== lastFrameUrl) {
          pageFrame.src = url;
          lastFrameUrl = url;
        }
      }
    }
  }

  let running = false;
  async function refresh() {
    if (running) return;
    running = true;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      let response;
      try {
        response = await fetch('./hunt-location.json', {
          cache: 'no-store', signal: controller.signal
        });
      } finally { clearTimeout(timeout); }
      if (!response.ok) throw new Error('Map data unavailable');
      draw(await response.json());
    } catch {
      draw(null); // Never show an unconfirmed or stale pin.
      if (pageExpiry) pageExpiry.textContent = 'Unable to verify the current pin. Check the official Facebook Page.';
    } finally { running = false; }
  }
  refresh();
  setInterval(refresh, 45000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
}
