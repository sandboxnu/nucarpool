import { Map } from "mapbox-gl";
import PulsingDot from "./PulsingDot";

const updateUserLocation = (
  map: Map,
  userLongitude: number,
  userLatitude: number,
) => {
  if (map.getSource("dot-point")) {
    const source = map.getSource("dot-point") as mapboxgl.GeoJSONSource;
    // Update the data for dot-point user location
    source.setData({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [userLongitude, userLatitude],
      },
      properties: {},
    });
  } else {
    map.addSource("dot-point", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [userLongitude, userLatitude], // icon position [lng, lat]
        },
        properties: {},
      },
    });
    map.addImage("pulsing-dot", new PulsingDot(100, map), {
      pixelRatio: 2,
    });
    map.addLayer({
      id: "layer-with-pulsing-dot",
      type: "symbol",
      source: "dot-point",
      layout: {
        "icon-image": "pulsing-dot",
        "icon-allow-overlap": true,
      },
    });
  }
};

export default updateUserLocation;
