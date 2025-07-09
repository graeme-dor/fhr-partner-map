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

// Set initial center and zoom (zoom changed from 5 to 6)
const map = L.map('map').setView([-28.5, 24.5], 6);
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
          // Fields to exclude from the popup
          const excludeFields = [
          	"No.",
            "Latitude",
            "Longitude",
            "X",
            "Y",
            "",
            "Unnamed: 0"
          ];

          // Filter entry to exclude unwanted fields
          const filteredEntries = Object.entries(entry).filter(
            ([key, _]) => !excludeFields.includes(key)
          );

          // Build popup content from filtered fields
          const popupContent = `
            <b>${sheetName}</b><br>` +
            filteredEntries.map(([k, v]) => `<b>${k}:</b> ${v}`).join("<br>");

          // Create the marker and bind popup
          const marker = L.circleMarker([lat, lon], {
            radius: 6,
            fillColor: colors[sheetName],
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          }).bindPopup(popupContent);

          layers[sheetName].addLayer(marker);
        }
      });

      layers[sheetName].addTo(map);
    });
}

// JSON files to load for each sheet
const jsonFiles = {
  "GBV Masibambisane Orgns": "GBV_Masibambisane_Orgns.json",
  "Growing Food Orgns": "Growing_Food_Orgns.json",
  "Human Rights Clubs": "Human_Rights_Clubs.json",
  "TRC Cases Supported": "TRC_Cases_Supported.json"
};

// Load data for each theme
for (const [sheetName, jsonFile] of Object.entries(jsonFiles)) {
  loadData(sheetName, jsonFile);
}

// Add layer control to top right
L.control.layers(null, layers, { position: 'topright', collapsed: false }).addTo(map);