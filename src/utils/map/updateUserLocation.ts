import { Map } from "mapbox-gl";
import addUserLocation from "./addUserLocation";

const updateUserLocation = (
  map: Map,
  userLongitude: number,
  userLatitude: number
) => {
  if (map.getSource("dot-point")) {
    // Check if the source exists
    const source = map.getSource("dot-point") as mapboxgl.GeoJSONSource; // Typecast to GeoJSONSource for TypeScript
    // Update the data for the 'dot-point' source
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
