document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("dataLoaded", () => {
    const markers = window.allMarkers || [];
    const layers = window.layers || {};

    const normalize = (p) => {
      if (!p) return "";
      const cleaned = p.trim().toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ');
      const map = {
        "kwazulu natal": "KwaZulu-Natal",
        "eastern cape": "Eastern Cape",
        "western cape": "Western Cape",
        "northern cape": "Northern Cape",
        "north west": "North West",
        "free state": "Free State",
        "gauteng": "Gauteng",
        "limpopo": "Limpopo",
        "mpumalanga": "Mpumalanga"
      };
      return map[cleaned] || p.trim();
    };

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
      m.normalizedProvince = normalize(m.province);
      if (m.normalizedProvince) {
        provinceSet.add(m.normalizedProvince);
      }
    });

    const select = document.getElementById("provinceSelect");
    if (!select) return;

    // Clear any existing options first
    select.innerHTML = '<option value="All">All Provinces</option>';

    [...provinceSet].sort().forEach(prov => {
      const option = document.createElement("option");
      option.value = prov;
      option.textContent = prov;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      const selected = e.target.value;

      markers.forEach(({ marker, normalizedProvince, layerName }) => {
        const layer = layers[layerName];
        if (selected === "All" || normalizedProvince === selected) {
          layer.addLayer(marker);
        } else {
          layer.removeLayer(marker);
        }
      });

      if (selected in provinceBounds) {
        map.fitBounds(provinceBounds[selected]);
      } else {
        map.setView([-28.5, 24.5], 6);
      }
    });
  });
});