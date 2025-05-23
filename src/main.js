import "./style.css";
import mapboxgl from "mapbox-gl";

document.querySelector("#app").innerHTML = `
  <div>
    <div id="map" style="width: 90vw; height: 90vh;"></div>
    <div id="style-switcher" style="margin-top: 1em;">
      <label><input type="radio" name="map-style" value="street" checked> Street</label>
      <label><input type="radio" name="map-style" value="mono"> Mono</label>
      <label><input type="radio" name="map-style" value="night"> Night</label>
      <span id="bounds-output" style="margin-left:2em;"></span>
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

function updateBounds() {
  if (map) {
    const bounds = map.getBounds();
    document.getElementById("bounds-output").textContent = `Bounds: ${bounds
      .toArray()
      .join(" | ")}`;
  }
}

function createCustomMarker() {
  const el = document.createElement("div");
  el.className = "custom-marker";
  return el;
}

function createPopup(lngLat) {
  return new mapboxgl.Popup({ closeButton: false, offset: 25 }).setHTML(
    '<div style="padding:8px;"><strong>Vancouver Convention Centre</strong><br><span style="color:#888;">1055 Canada Pl, Vancouver, BC</span></div>'
  );
}

function addMarkerWithPopup({ lngLat, markerEl, popup, map }) {
  const m = markerEl ? new mapboxgl.Marker(markerEl) : new mapboxgl.Marker();
  m.setLngLat(lngLat).setPopup(popup).addTo(map);
  m.getElement().addEventListener("mouseenter", () => {
    popup.setLngLat(lngLat).addTo(map);
  });
  m.getElement().addEventListener("mouseleave", () => {
    popup.remove();
  });
  return m;
}

function initializeMap(center, style) {
  map = new mapboxgl.Map({
    container: "map",
    style: styleMap[style],
    center,
    zoom: 16,
    attributionControl: false,
  });

  map.addControl(new mapboxgl.NavigationControl());

  popup = createPopup(VANCOUVER_CONVENTION_CENTRE);
  marker = addMarkerWithPopup({
    lngLat: VANCOUVER_CONVENTION_CENTRE,
    markerEl: createCustomMarker(),
    popup,
    map,
  });
  const defaultMarkerLngLat = [
    VANCOUVER_CONVENTION_CENTRE[0] + 0.001,
    VANCOUVER_CONVENTION_CENTRE[1],
  ];
  const defaultMarkerPopup = createPopup(defaultMarkerLngLat);
  addMarkerWithPopup({
    lngLat: defaultMarkerLngLat,
    markerEl: null,
    popup: defaultMarkerPopup,
    map,
  });

  map.on("move", updateBounds);
  updateBounds();

  map.on("load", () => {
    map.addSource("waterfront", {
      type: "vector",
      url: "mapbox://tingyun6046710542.cmaubh2ku26xm1nl3gd1jwvqc-8fa66",
    });
    map.addLayer({
      id: "waterfront-layer",
      type: "fill",
      source: "waterfront",
      "source-layer": "waterfront",
      paint: {
        "fill-color": ["get", "fill"],
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.4,
          0.2,
        ],
        "fill-outline-color": ["get", "stroke"],
      },
    });

    map.addSource("waterfront-buildings", {
      type: "vector",
      url: "mapbox://tingyun6046710542.cmauiefxv0wqi1mphi07if5re-5oypb",
    });
    map.addLayer({
      id: "waterfront-buildings-layer",
      type: "fill",
      source: "waterfront-buildings",
      "source-layer": "waterfront-buildings",
      paint: {
        "fill-color": ["get", "fill"],
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.4,
          0.2,
        ],
        "fill-outline-color": ["get", "stroke"],
      },
    });

    // Hover highlight for both layers
    let hoveredId = null;
    function setupHover(layerId) {
      map.on("mousemove", layerId, (e) => {
        if (e.features.length > 0) {
          if (hoveredId !== null) {
            map.setFeatureState(
              {
                source: map.getLayer(layerId).source,
                sourceLayer: map.getLayer(layerId)["source-layer"],
                id: hoveredId,
              },
              { hover: false }
            );
          }
          hoveredId = e.features[0].id;
          map.setFeatureState(
            {
              source: map.getLayer(layerId).source,
              sourceLayer: map.getLayer(layerId)["source-layer"],
              id: hoveredId,
            },
            { hover: true }
          );
        }
      });
      map.on("mouseleave", layerId, () => {
        if (hoveredId !== null) {
          map.setFeatureState(
            {
              source: map.getLayer(layerId).source,
              sourceLayer: map.getLayer(layerId)["source-layer"],
              id: hoveredId,
            },
            { hover: false }
          );
        }
        hoveredId = null;
      });
    }
    setupHover("waterfront-layer");
    setupHover("waterfront-buildings-layer");
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
        marker = addMarkerWithPopup({
          lngLat: VANCOUVER_CONVENTION_CENTRE,
          markerEl: createCustomMarker(),
          popup,
          map,
        });
        const defaultMarkerLngLat2 = [
          VANCOUVER_CONVENTION_CENTRE[0] + 0.001,
          VANCOUVER_CONVENTION_CENTRE[1],
        ];
        const defaultMarkerPopup2 = createPopup(defaultMarkerLngLat2);
        addMarkerWithPopup({
          lngLat: defaultMarkerLngLat2,
          markerEl: null,
          popup: defaultMarkerPopup2,
          map,
        });
      });
    }
  });
});
