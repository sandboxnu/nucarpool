import { Map } from "mapbox-gl";
import addUserLocation from "./addUserLocation";

const updateUserLocation = (
  map: Map,
  userLongitude: number,
  userLatitude: number
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
    addUserLocation(map, userLongitude, userLatitude);
  }
};

export default updateUserLocation;
