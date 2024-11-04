import { GeoJsonUsers } from "../types";
import mapboxgl from "mapbox-gl";
import addClusters from "./addClusters";
import { Map } from "mapbox-gl";

const updateGeoJsonUsers = (map: Map, geoJsonUsers: GeoJsonUsers) => {
  if (map.getSource("company-locations")) {
    const source = map.getSource("company-locations") as mapboxgl.GeoJSONSource;
    source.setData(geoJsonUsers);
  } else {
    addClusters(map, geoJsonUsers);
  }
};
export default updateGeoJsonUsers;
