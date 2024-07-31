import { Map } from "mapbox-gl";
import { GeoJsonUsers } from "../types";
import OrangeSquare from "../../../public/orange-square.png";
import RedSquare from "../../../public/red-square.png";
/**
 * Filter Expression: https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/
 * Clusters example with filter expression: https://docs.mapbox.com/mapbox-gl-js/example/cluster-html/
 * Clusters example: https://docs.mapbox.com/mapbox-gl-js/example/cluster/
 */

const addClusters = (map: Map, geoJsonUsers: GeoJsonUsers) => {
  map.addSource("company-locations", {
    type: "geojson",
    data: geoJsonUsers,
    cluster: true,
    clusterMaxZoom: 10,
    clusterRadius: 50,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "company-locations",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6",
        20,
        "#f1f075",
        100,
        "#f28cb1",
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        20, // point count > 20
        30,
        100, // point count > 100
        40,
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "company-locations",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });
  console.log("Adding source to map with GeoJSON data:", geoJsonUsers); // Log GeoJSON data

  // Add Driver Locations
  map.loadImage(OrangeSquare.src, (error, orangeImage) => {
    if (error || !orangeImage) throw error;
    map.addImage("rider-marker", orangeImage);
    map.loadImage(RedSquare.src, (error, blueImage) => {
      if (error || !blueImage) throw error;
      map.addImage("driver-marker", blueImage);
      // Layer for Rider markers
      map.addLayer({
        id: "riders",
        type: "symbol",
        source: "company-locations",
        filter: [
          "all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "role"], "RIDER"],
        ],
        layout: {
          "icon-image": "rider-marker",
          "icon-size": 0.35,
        },
      });
      // Layer for Driver markers
      map.addLayer({
        id: "drivers",
        type: "symbol",
        source: "company-locations",
        filter: [
          "all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "role"], "DRIVER"],
        ],
        layout: {
          "icon-image": "driver-marker",
          "icon-size": 1,
        },
      });
    });
  });
};

export default addClusters;
