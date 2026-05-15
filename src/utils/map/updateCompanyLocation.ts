import mapboxgl, { MapLayerMouseEvent } from "mapbox-gl";
import BlueEnd from "../../../public/user-dest.png";
import BlueDriverEnd from "../../../public/user-dest-driver.png";
import RedDriverEnd from "../../../public/driver-dest.png";
import OrangeRiderEnd from "../../../public/rider-dest.png";
import { Role } from "@prisma/client";
import { GeoJSON } from "geojson";
import { PublicUser } from "../types";
import { getPointClickHandler } from "./handlers";

const updateCompanyLocation = (
  map: mapboxgl.Map,
  companyLongitude: number,
  companyLatitude: number,
  role: Role,
  userId: string,
  userData?: PublicUser,
  isCurrent: boolean = false,
  remove: boolean = false,
  customLabel?: string,
): void => {
  let img, sourceId: string, layerId: string, textLayerId: string;

  if (isCurrent) {
    img = role === Role.DRIVER ? BlueDriverEnd.src : BlueEnd.src;
    sourceId = "current-user-company-source";
    layerId = "current-user-company-layer";
    textLayerId = "current-user-company-text-layer";
  } else {
    img = role === Role.DRIVER ? RedDriverEnd.src : OrangeRiderEnd.src;
    sourceId = `other-user-${userId}-company-source`;
    layerId = `other-user-${userId}-company-layer`;
    textLayerId = `other-user-${userId}-company-text-layer`;
  }
  
  if (remove) {
    if (map.getLayer(textLayerId)) {
      map.removeLayer(textLayerId);
    }
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
      properties: {
        ...(userData || {
          id: userId,
          role: role,
        }),
        label: customLabel || (userData?.preferredName || userData?.name || "Destination"),
      }
    };

    // Create source if it doesn't exist
    let source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      // If source exists, update its data
      source.setData(feature);
      
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "icon-image": imageId,
            "icon-allow-overlap": true,
            "icon-size": 0.33,
          },
        }, "waterway-label");
        
        if (!isCurrent) {
          const handlePointClick = getPointClickHandler();
          map.on("click", layerId, (e) => {
            if (!e.features) return;
            handlePointClick!(e as MapLayerMouseEvent);
          });
        }
      }
      
      if (customLabel && !map.getLayer(textLayerId)) {
        map.addLayer({
          id: textLayerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "text-field": ["get", "label"],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 14,
            "text-offset": [0, 1.8],
            "text-anchor": "top",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": "#000000",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2.5,
            "text-halo-blur": 0.5,
          },
          minzoom: 0,
        }, "waterway-label");
      }
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
      }, "waterway-label");
      
      if (customLabel) {
        map.addLayer({
          id: textLayerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "text-field": ["get", "label"],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 14,
            "text-offset": [0, 1.8],
            "text-anchor": "top",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": "#000000",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2.5,
            "text-halo-blur": 0.5,
          },
          minzoom: 0,
        }, "waterway-label");
      }
      
      if (!isCurrent) {
        // click event for request user markers
        const handlePointClick = getPointClickHandler();
        map.on("click", layerId, (e) => {
          if (!e.features) return;
          handlePointClick!(e as MapLayerMouseEvent);
        });
      }
    }
  });
};

export default updateCompanyLocation;
