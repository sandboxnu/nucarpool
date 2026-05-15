import mapboxgl from "mapbox-gl";
import { GeoJSON } from "geojson";
import { Role } from "@prisma/client";
import { PublicUser } from "../types";
import DriverStart from "../../../public/driver-start.png";
import RiderStart from "../../../public/rider-start.png";

const updateStartLocation = (
  map: mapboxgl.Map,
  startLongitude: number,
  startLatitude: number,
  role: Role,
  userId: string,
  userData?: PublicUser,
  isCurrent: boolean = false,
  remove: boolean = false,
  customLabel?: string,
): void => {
  let img, sourceId: string, layerId: string, textLayerId: string;

  if (isCurrent) {
    // For current user, we use the pulsing dot from updateUserLocation
    return; // Don't create a separate marker for current user start
  } else {
    img = role === Role.DRIVER ? DriverStart.src : RiderStart.src;
    sourceId = `other-user-${userId}-start-source`;
    layerId = `other-user-${userId}-start-layer`;
    textLayerId = `other-user-${userId}-start-text-layer`;
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
        coordinates: [startLongitude, startLatitude],
      },
      properties: {
        ...(userData || {
          id: userId,
          role: role,
        }),
        label: customLabel || (userData?.preferredName || userData?.name || "Start"),
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
    }
  });
};

export default updateStartLocation;
