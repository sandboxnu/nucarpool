import { Role, Status } from "@prisma/client";
import { Feature, FeatureCollection } from "geojson";
import { Map } from "mapbox-gl";
import { GeoJsonUsers } from "../types";
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
    clusterMaxZoom: 14,
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

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "company-locations",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#f97316",
      //   "case",
      //   [
      //     "all",
      //     ["==", ["get", "status"], Status.ACTIVE], // active user
      //     ["==", ["get", "role"], Role.RIDER], // also a rider
      //   ],
      //   "#0ea5e9", // blue-ish color
      //   [
      //     "all",
      //     ["==", ["get", "status"], Status.ACTIVE], // active user
      //     ["==", ["get", "role"], Role.DRIVER], // also a driver
      //   ],
      //   "#f97316", // red-ish color
      // "#808080", // gray for inactive user
      "circle-radius": 10,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  });
};

export default addClusters;
