import mapboxgl, { Map } from "mapbox-gl";
import BlueEnd from "../../../public/blue-square.png";

// Variable to hold the marker reference
let companyMarker: mapboxgl.Marker | null = null;

const updateCompanyLocation = (
  map: mapboxgl.Map,
  companyLongitude: number,
  companyLatitude: number
) => {
  if (companyMarker) {
    // If the marker exists, remove it first
    companyMarker.remove();
  }
  // If the marker doesn't exist, create it
  const el = document.createElement("img");
  el.src = BlueEnd.src;
  el.style.marginTop = "1em";
  el.style.opacity = "1";

  companyMarker = new mapboxgl.Marker({ element: el })
    .setLngLat([companyLongitude, companyLatitude])
    .addTo(map);
};

export default updateCompanyLocation;
