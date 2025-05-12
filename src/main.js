import "./style.css";
import mapboxgl from "mapbox-gl";

document.querySelector("#app").innerHTML = `
  <div>
    <div id="map" style="width: 90vw; height: 90vh;"></div>
    <div id="style-switcher" style="margin-top: 1em;">
      <label><input type="radio" name="map-style" value="street" checked> Street</label>
      <label><input type="radio" name="map-style" value="mono"> Mono</label>
      <label><input type="radio" name="map-style" value="night"> Night</label>
    </div>
  </div>
`;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const styleMap = {
  street: import.meta.env.VITE_MAPBOX_STYLE_FADED_DAY,
  mono: import.meta.env.VITE_MAPBOX_STYLE_MONO_DAY,
  night: "mapbox://styles/mapbox/dark-v11",
};

const VANCOUVER_CONVENTION_CENTRE = [-123.113952, 49.28843];

let map;
let marker;
let popup;
function initializeMap(center, style) {
  map = new mapboxgl.Map({
    container: "map",
    style: styleMap[style],
    center,
    zoom: 16,
    attributionControl: false,
  });

  // Create a popup with custom HTML
  popup = new mapboxgl.Popup({ closeButton: false, offset: 40 }).setHTML(
    '<div style="padding:8px;"><strong>Vancouver Convention Centre</strong><br><span style="color:#888;">1055 Canada Pl, Vancouver, BC</span></div>'
  );

  // Create a marker at the Vancouver Convention Centre
  marker = new mapboxgl.Marker()
    .setLngLat(VANCOUVER_CONVENTION_CENTRE)
    .addTo(map);

  // Show popup on hover
  marker.getElement().addEventListener("mouseenter", () => {
    console.log("mouseenter");
    popup.setLngLat(VANCOUVER_CONVENTION_CENTRE).addTo(map);
  });
  marker.getElement().addEventListener("mouseleave", () => {
    console.log("mouseleave");
    popup.remove();
  });
}

initializeMap(VANCOUVER_CONVENTION_CENTRE, "street");

document.querySelectorAll('input[name="map-style"]').forEach((el) => {
  el.addEventListener("change", (e) => {
    if (map && e.target.checked) {
      map.setStyle(styleMap[e.target.value]);
      map.once("styledata", () => {
        marker.remove();
        popup.remove();
        marker = new mapboxgl.Marker()
          .setLngLat(VANCOUVER_CONVENTION_CENTRE)
          .addTo(map);
        marker.getElement().addEventListener("mouseenter", () => {
          popup.setLngLat(VANCOUVER_CONVENTION_CENTRE).addTo(map);
        });
        marker.getElement().addEventListener("mouseleave", () => {
          popup.remove();
        });
      });
    }
  });
});
