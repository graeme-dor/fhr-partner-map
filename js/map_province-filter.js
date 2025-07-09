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

// Create province filter dropdown
const provinceFilter = document.createElement('select');
provinceFilter.id = 'province-filter';
provinceFilter.style.position = 'absolute';
provinceFilter.style.top = '15px';
provinceFilter.style.left = '15px';
provinceFilter.style.zIndex = '1002';
provinceFilter.style.padding = '6px';
provinceFilter.style.borderRadius = '4px';
provinceFilter.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
provinceFilter.style.background = 'white';
provinceFilter.innerHTML = '<option value="">All Provinces</option>';
document.body.appendChild(provinceFilter);

const allMarkers = [];
const allProvinces = new Set();

function loadData(sheetName, jsonFile) {
  fetch('data/' + jsonFile)
    .then(response => response.json())
    .then(data => {
      data.forEach(entry => {
        const lat = parseFloat(entry["Latitude"]);
        const lon = parseFloat(entry["Longitude"]);
        const province = entry["Province"] || "";

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
          marker.province = province;
          marker.sheet = sheetName;
          layers[sheetName].addLayer(marker);
          allMarkers.push(marker);
          allProvinces.add(province);
        }
      });

      layers[sheetName].addTo(map);

      // Populate dropdown after all layers are loaded
      if (Object.keys(layers).every(name => map.hasLayer(layers[name]))) {
        const sortedProvinces = Array.from(allProvinces).sort();
        sortedProvinces.forEach(prov => {
          const option = document.createElement('option');
          option.value = prov;
          option.text = prov;
          provinceFilter.appendChild(option);
        });
      }
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

// Filtering logic
provinceFilter.addEventListener('change', () => {
  const selected = provinceFilter.value;
  allMarkers.forEach(marker => {
    if (!selected || marker.province === selected) {
      if (!map.hasLayer(marker)) marker.addTo(map);
    } else {
      if (map.hasLayer(marker)) map.removeLayer(marker);
    }
  });
});

// Add layer toggles
L.control.layers(null, layers, { position: 'topright', collapsed: false }).addTo(map);