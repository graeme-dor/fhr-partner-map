const layers = {
  "GBV Masibambisane Orgns": L.layerGroup(),
  "Growing Food Orgns": L.layerGroup(),
  "Human Rights Clubs": L.layerGroup(),
  "TRC Cases Supported": L.layerGroup()
};

const colors = {
  "GBV Masibambisane Orgns": "purple",
  "Growing Food Orgns": "green",
  "Human Rights Clubs": "blue",
  "TRC Cases Supported": "orange"
};

const map = L.map('map').setView([-28.5, 24.5], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

function loadData(sheetName, jsonFile) {
  fetch('data/' + jsonFile)
    .then(response => response.json())
    .then(data => {
      data.forEach(entry => {
        const lat = parseFloat(entry["Latitude"]);
        const lon = parseFloat(entry["Longitude"]);

        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.circleMarker([lat, lon], {
            radius: 6,
            fillColor: colors[sheetName],
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          }).bindPopup(
            `<b>${sheetName}</b><br>` +
            Object.entries(entry).map(([k, v]) => `<b>${k}:</b> ${v}`).join("<br>")
          );

          layers[sheetName].addLayer(marker);
        }
      });

      layers[sheetName].addTo(map);
    });
}

const jsonFiles = {
  "GBV Masibambisane Orgns": "GBV_Masibambisane_Orgns.json",
  "Growing Food Orgns": "Growing_Food_Orgns.json",
  "Human Rights Clubs": "Human_Rights_Clubs.json",
  "TRC Cases Supported": "TRC_Cases_Supported.json"
};

for (const [sheetName, jsonFile] of Object.entries(jsonFiles)) {
  loadData(sheetName, jsonFile);
}

// Add layer toggles
L.control.layers(null, layers, { position: 'topright', collapsed: false }).addTo(map);