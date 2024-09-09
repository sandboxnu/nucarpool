import mapboxgl from "mapbox-gl";
import BlueEnd from "../../../public/user-dest.png";
import BlueDriverEnd from "../../../public/user-dest-driver.png";

import { Role } from "@prisma/client";

let companyMarkerSourceId = "company-marker-source"; // Source ID for reference
const updateCompanyLocation = (
  map: mapboxgl.Map,
  companyLongitude: number,
  companyLatitude: number,
  role: Role
): void => {
  let img = BlueEnd.src;
  if (role === Role.DRIVER) {
    img = BlueDriverEnd.src;
  }
  map.loadImage(
    img,
    (
      error: Error | undefined,
      image: HTMLImageElement | ImageBitmap | undefined
    ) => {
      if (error) throw error;

      if (!map.hasImage("user-company")) {
        if (image instanceof HTMLImageElement || image instanceof ImageBitmap) {
          map.addImage("user-company", image);
        }
      }

      const feature: GeoJSON.Feature<GeoJSON.Point> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [companyLongitude, companyLatitude],
        },
        properties: {},
      };

      // Create source if it doesn't exist
      let source = map.getSource(companyMarkerSourceId) as
        | mapboxgl.GeoJSONSource
        | undefined;
      if (source) {
        // If source exists, update its data
        source.setData(feature);
      } else {
        // Create the source and layer if they don't exist
        map.addSource(companyMarkerSourceId, {
          type: "geojson",
          data: feature,
        });

        map.addLayer({
          id: "company-marker-layer",
          type: "symbol",
          source: companyMarkerSourceId,
          layout: {
            "icon-image": "user-company",
            "icon-allow-overlap": true,
            "icon-size": 0.33,
          },
        });
      }
    }
  );
};

export default updateCompanyLocation;
