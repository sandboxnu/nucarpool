import mapboxgl from "mapbox-gl";
import BlueEnd from "../../../public/user-dest.png";
import BlueDriverEnd from "../../../public/user-dest-driver.png";
import RedDriverEnd from "../../../public/driver-dest.png";
import OrangeRiderEnd from "../../../public/rider-dest.png";
import { Role } from "@prisma/client";
import { GeoJSON } from "geojson";

const updateCompanyLocation = (
  map: mapboxgl.Map,
  companyLongitude: number,
  companyLatitude: number,
  role: Role,
  userId: string,
  isCurrent: boolean = false,
  remove: boolean = false
): void => {
  let img, sourceId: string, layerId: string;

  if (isCurrent) {
    img = role === Role.DRIVER ? BlueDriverEnd.src : BlueEnd.src;
    sourceId = "current-user-company-source";
    layerId = "current-user-company-layer";
  } else {
    img = role === Role.DRIVER ? RedDriverEnd.src : OrangeRiderEnd.src;
    sourceId = `other-user-${userId}-company-source`;
    layerId = `other-user-${userId}-company-layer`;
  }
  if (remove) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
    if (map.hasImage(`${sourceId}-image`)) {
      map.removeImage(`${sourceId}-image`);
    }
    return;
  }
  map.loadImage(img, (error, image) => {
    if (error) throw error;

    const imageId = `${sourceId}-image`;
    if (!map.hasImage(imageId)) {
      if (image instanceof HTMLImageElement || image instanceof ImageBitmap) {
        map.addImage(imageId, image);
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
    let source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      // If source exists, update its data
      source.setData(feature);
    } else {
      // Create the source and layer if they don't exist
      map.addSource(sourceId, {
        type: "geojson",
        data: feature,
      });

      map.addLayer({
        id: layerId,
        type: "symbol",
        source: sourceId,
        layout: {
          "icon-image": imageId,
          "icon-allow-overlap": true,
          "icon-size": 0.33,
        },
      });
    }
  });
};

export default updateCompanyLocation;
