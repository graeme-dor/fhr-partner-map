window.layers = {
  "GBV Masibambisane Partners": L.layerGroup(),
  "Growing Food Partners": L.layerGroup(),
  "Human Rights Clubs": L.layerGroup(),
  "TRC Cases Supported": L.layerGroup()
};

const colors = {
  "GBV Masibambisane Partners": "purple",
  "Growing Food Partners": "green",
  "Human Rights Clubs": "blue",
  "TRC Cases Supported": "orange"
};

// Initialize map without setting view yet
const map = L.map('map', {
  minZoom: 3,  // Prevent zooming too far out
  maxZoom: 12  // Keep your current max
});

// Set bounds to cover all of South Africa
const southAfricaBounds = L.latLngBounds(
  [-35.0, 16.0],  // Southwest corner
  [-22.0, 33.0]   // Northeast corner
);

window.addEventListener("load", () => {
  setTimeout(() => {
    map.invalidateSize(); // Recalculate container dimensions
    map.fitBounds(southAfricaBounds); // Then fit to bounds
  }, 100); // Delay to ensure layout is complete
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Credit attribution
map.attributionControl.addAttribution(
  'Web Map by <strong>Graeme Dor</strong> & <a href="https://datavisionanalytics.com" target="_blank" rel="noopener noreferrer">DataVision Analytics</a>'
);

window.allMarkers = [];

const jsonFiles = {
  "GBV Masibambisane Partners": "GBV_Masibambisane_Partners.json",
  "Growing Food Partners": "Growing_Food_Partners.json",
  "Human Rights Clubs": "Human_Rights_Clubs.json",
  "TRC Cases Supported": "TRC_Cases_Supported.json"
};

let completedLoads = 0;
const totalLoads = Object.keys(jsonFiles).length;

function checkIfReady() {
  completedLoads++;
  if (completedLoads === totalLoads) {
    window.dispatchEvent(new Event("dataLoaded"));
  }
}

function loadData(sheetName, jsonFile) {
  fetch('data/' + jsonFile)
    .then(response => response.json())
    .then(data => {
      data.forEach(entry => {
        const lat = parseFloat(entry["Latitude"]);
        const lon = parseFloat(entry["Longitude"]);

        if (!isNaN(lat) && !isNaN(lon)) {
          const excludeFields = ["No", "Latitude", "Longitude", "Physical Address", "Address", "Physical Address (Google Map)", "Stage of the proceedings", "TRC"];
          const filteredEntries = Object.entries(entry).filter(
            ([key, _]) => !excludeFields.includes(key)
          );

          const popupContent = `
            <b>${sheetName}</b><br>` +
            filteredEntries.map(([k, v]) => {
              const value = (typeof v === 'string' && v.startsWith('http'))
               ? `<a href="${v}" target="_blank" rel="noopener noreferrer">${v}</a>`
               : v;
              return `<b>${k}:</b> ${value}`;
            }).join("<br>");

          const marker = L.circleMarker([lat, lon], {
            radius: 6,  // Slightly larger for visibility
            fillColor: colors[sheetName],
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          }).bindPopup(popupContent);

          window.layers[sheetName].addLayer(marker);

          window.allMarkers.push({
            marker,
            province: entry["Province"],
            layerName: sheetName
          });
        }
      });

      window.layers[sheetName].addTo(map);
      checkIfReady();
    });
}

for (const [sheetName, jsonFile] of Object.entries(jsonFiles)) {
  loadData(sheetName, jsonFile);
}

L.control.layers(null, window.layers, { position: 'topright', collapsed: false }).addTo(map);

// Legend click-to-filter
document.querySelectorAll('.legend div').forEach(div => {
  div.addEventListener('click', () => {
    const label = div.textContent.trim();
    const mapping = {
      'GBV Masibambisane Partners': 'GBV Masibambisane Partners',
      'Growing Food Partners': 'Growing Food Partners',
      'Human Rights Clubs': 'Human Rights Clubs',
      'TRC Cases Supported': 'TRC Cases Supported'
    };
    const selected = mapping[label];

    Object.values(window.layers).forEach(layer => map.removeLayer(layer));
    if (selected in window.layers) {
      map.addLayer(window.layers[selected]);
    }

    document.querySelectorAll('.legend div').forEach(d => d.classList.remove('active'));
    div.classList.add('active');

    const select = document.getElementById('provinceSelect');
    if (select) select.value = "All";
  });
});