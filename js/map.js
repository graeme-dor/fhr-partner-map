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

// Set bounds for South Africa
//const southAfricaBounds = L.latLngBounds(
//  [-35.0, 16.0],
//  [-22.0, 33.0]
//);

// Determine device width and set zoom
const isMobile = window.innerWidth < 768;
const initialZoom = isMobile ? 4 : 5;

// Initialize the map centered on South Africa
const map = L.map('map', {
  center: [-28.5, 24.5], // Rough center of SA
  zoom: initialZoom,
  minZoom: 4,
  maxZoom: 12
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Attribution
map.attributionControl.addAttribution(
  'Probono design by <strong>Graeme Dor</strong> & <a href="https://datavisionanalytics.com" target="_blank" rel="noopener noreferrer">DataVision Analytics</a>'
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
            radius: 6,
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

// Legend filtering
document.querySelectorAll('.legend div').forEach(div => {
  div.addEventListener('click', () => {
    const selected = div.dataset.layer;

    // Remove all layers
    Object.values(window.layers).forEach(layer => map.removeLayer(layer));

    // Add selected layer
    if (selected in window.layers) {
      map.addLayer(window.layers[selected]);
    }

    // Update legend styling
    document.querySelectorAll('.legend div').forEach(d => d.classList.remove('active'));
    div.classList.add('active');

    // Reset province dropdown
    const select = document.getElementById('provinceSelect');
    if (select) select.value = "All";
  });
});

// Province filtering
window.addEventListener("dataLoaded", () => {
  const markers = window.allMarkers || [];
  const layers = window.layers || {};
  const provinceBounds = {
    "Eastern Cape": [[-34.2, 22.3], [-30.5, 30.1]],
    "Free State": [[-30.7, 24.3], [-26.3, 29.5]],
    "Gauteng": [[-26.7, 27.4], [-25.6, 28.7]],
    "KwaZulu-Natal": [[-30.9, 28.5], [-26.8, 32.0]],
    "Limpopo": [[-25.7, 26.3], [-22.1, 31.5]],
    "Mpumalanga": [[-26.9, 28.5], [-24.6, 32.0]],
    "North West": [[-27.6, 22.9], [-24.7, 28.3]],
    "Northern Cape": [[-32.0, 16.4], [-27.0, 24.0]],
    "Western Cape": [[-34.8, 18.2], [-31.6, 22.9]]
  };

  const provinceSet = new Set();
  markers.forEach(m => {
    if (m.province) {
      provinceSet.add(m.province);
    }
  });

  const select = document.getElementById("provinceSelect");
  if (!select) return;

  [...provinceSet].sort().forEach(prov => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    const selected = e.target.value;

    markers.forEach(({ marker, province, layerName }) => {
      const layer = layers[layerName];
      if (selected === "All" || province === selected) {
        layer.addLayer(marker);
      } else {
        layer.removeLayer(marker);
      }
    });

    if (selected in provinceBounds) {
      map.fitBounds(provinceBounds[selected]);
    } else {
      // All Provinces selected: adjust zoom by device
      const isMobile = window.innerWidth < 768;
      map.setView([-28.5, 24.5], isMobile ? 4 : 5);
    }
  });
});