import mapboxgl from "mapbox-gl";
import { CarpoolAddress, CarpoolFeature, PublicUser, User } from "../types";
import { trpc } from "../trpc";
import { SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import polyline from "@mapbox/polyline";
import { GeoJSON, LineString } from "geojson";
import { StaticImageData } from "next/image";
import DriverStart from "../../../public/driver-start.png";
import RiderStart from "../../../public/rider-start.png";
import DriverEnd from "../../../public/driver-dest.png";
import RiderEnd from "../../../public/rider-dest.png";

const previousMarkers: (mapboxgl.Marker | mapboxgl.Popup)[] = [];
export const clearMarkers = () => {
  previousMarkers.forEach((element) => {
    element.remove();
  });
  previousMarkers.length = 0;
};

export const clearDirections = (map: mapboxgl.Map) => {
  if (map.getLayer("route")) {
    map.removeLayer("route");
  }
  if (map.getSource("route")) {
    map.removeSource("route");
  }
};

const createPopup = (text: string) => {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  }).setText(text);
  popup.addClassName("custom-marker-popup");
  return popup;
};

const createMarkerEl = (imgData: StaticImageData) => {
  const img = new Image();
  img.src = imgData.src;
  img.width = 32;
  img.height = 42;
  return img;
};
interface ViewRouteProps {
  user: User;
  otherUser: PublicUser | undefined;
  map: mapboxgl.Map;
  userCoord:
    | {
        startLat: number;
        startLng: number;
        endLat: number;
        endLng: number;
      }
    | undefined;
  isMobile?: boolean;
}

// Creates MapBox markers showing user's start address and the start area of the other user.
export const viewRoute = (props: ViewRouteProps) => {
  // First validate that all required inputs are valid
  if (!props.map || !props.user) {
    console.error("viewRoute called with invalid map or user");
    return;
  }

  clearMarkers();
  clearDirections(props.map);
  const redCircle = createMarkerEl(DriverStart);
  const selfStartPopup = createPopup("My Start");
  const selfEndPopup = createPopup("My Dest.");
  const orangeStart = createMarkerEl(RiderStart);
  const redStart = createMarkerEl(redCircle);
  let minLng, minLat, maxLng, maxLat;

  // Validate otherUser coordinates
  if (props.otherUser !== undefined) {
    // Check if otherUser has all the required properties
    if (
      !Object.prototype.hasOwnProperty.call(props.otherUser, "startCoordLng") ||
      !Object.prototype.hasOwnProperty.call(props.otherUser, "startCoordLat") ||
      !Object.prototype.hasOwnProperty.call(
        props.otherUser,
        "companyCoordLng",
      ) ||
      !Object.prototype.hasOwnProperty.call(props.otherUser, "companyCoordLat")
    ) {
      console.error("otherUser missing required coordinate properties");
      return;
    }

    const otherStartLng = props.otherUser.startCoordLng;
    const otherStartLat = props.otherUser.startCoordLat;
    const otherCompanyLng = props.otherUser.companyCoordLng;
    const otherCompanyLat = props.otherUser.companyCoordLat;

    // Check if any otherUser coordinates are NaN, null, undefined, or not finite
    if (
      otherStartLng === null ||
      otherStartLat === null ||
      otherCompanyLng === null ||
      otherCompanyLat === null ||
      otherStartLng === undefined ||
      otherStartLat === undefined ||
      otherCompanyLng === undefined ||
      otherCompanyLat === undefined ||
      isNaN(otherStartLng) ||
      isNaN(otherStartLat) ||
      isNaN(otherCompanyLng) ||
      isNaN(otherCompanyLat) ||
      !isFinite(otherStartLng) ||
      !isFinite(otherStartLat) ||
      !isFinite(otherCompanyLng) ||
      !isFinite(otherCompanyLat)
    ) {
      console.error("Invalid coordinates in otherUser", {
        otherStartLng,
        otherStartLat,
        otherCompanyLng,
        otherCompanyLat,
      });
      return;
    }

    const otherRole =
      props.otherUser.role.charAt(0).toUpperCase() +
      props.otherUser.role.slice(1).toLowerCase();

    try {
      const otherUserStartPopup = createPopup(`${otherRole} Start`);
      const otherUserStartMarker = new mapboxgl.Marker({
        element: otherRole === "Rider" ? orangeStart : redStart,
      })
        .setLngLat([otherStartLng, otherStartLat])
        .setPopup(otherUserStartPopup)
        .addTo(props.map);

      const otherUserEndPopup = createPopup(`${otherRole} Dest.`);
      otherUserEndPopup
        .setLngLat([otherCompanyLng, otherCompanyLat])
        .addTo(props.map);

      otherUserStartMarker.togglePopup();
      previousMarkers.push(otherUserStartMarker);
      previousMarkers.push(otherUserEndPopup);
    } catch (error) {
      console.error("Error creating markers for otherUser", error);
      return;
    }

    minLng = Math.min(otherStartLng, otherCompanyLng);
    minLat = Math.min(otherStartLat, otherCompanyLat);
    maxLng = Math.max(otherStartLng, otherCompanyLng);
    maxLat = Math.max(otherStartLat, otherCompanyLat);
  }

  // Validate userCoord coordinates
  if (props.userCoord !== undefined) {
    // Check if userCoord has all the required properties
    if (
      !Object.prototype.hasOwnProperty.call(props.userCoord, "startLng") ||
      !Object.prototype.hasOwnProperty.call(props.userCoord, "startLat") ||
      !Object.prototype.hasOwnProperty.call(props.userCoord, "endLng") ||
      !Object.prototype.hasOwnProperty.call(props.userCoord, "endLat")
    ) {
      console.error("userCoord missing required coordinate properties");
      return;
    }

    const userStartLng = props.userCoord.startLng;
    const userStartLat = props.userCoord.startLat;
    const userEndLng = props.userCoord.endLng;
    const userEndLat = props.userCoord.endLat;

    // Check if any userCoord coordinates are NaN, null, undefined, or not finite
    if (
      userStartLng === null ||
      userStartLat === null ||
      userEndLng === null ||
      userEndLat === null ||
      userStartLng === undefined ||
      userStartLat === undefined ||
      userEndLng === undefined ||
      userEndLat === undefined ||
      isNaN(userStartLng) ||
      isNaN(userStartLat) ||
      isNaN(userEndLng) ||
      isNaN(userEndLat) ||
      !isFinite(userStartLng) ||
      !isFinite(userStartLat) ||
      !isFinite(userEndLng) ||
      !isFinite(userEndLat)
    ) {
      console.error("Invalid coordinates in userCoord", {
        userStartLng,
        userStartLat,
        userEndLng,
        userEndLat,
      });
      // If we have no valid coordinates at all, just return
      if (minLng === undefined) {
        return;
      }
    } else {
      try {
        selfStartPopup.setLngLat([userStartLng, userStartLat]).addTo(props.map);

        selfEndPopup.setLngLat([userEndLng, userEndLat]).addTo(props.map);
        previousMarkers.push(selfStartPopup);
        previousMarkers.push(selfEndPopup);
      } catch (error) {
        console.error("Error creating markers for userCoord", error);
        if (minLng === undefined) {
          return;
        }
      }

      minLng =
        minLng !== undefined
          ? Math.min(minLng, userStartLng, userEndLng)
          : Math.min(userStartLng, userEndLng);
      minLat =
        minLat !== undefined
          ? Math.min(minLat, userStartLat, userEndLat)
          : Math.min(userStartLat, userEndLat);
      maxLng =
        maxLng !== undefined
          ? Math.max(maxLng, userStartLng, userEndLng)
          : Math.max(userStartLng, userEndLng);
      maxLat =
        maxLat !== undefined
          ? Math.max(maxLat, userStartLat, userEndLat)
          : Math.max(userStartLat, userEndLat);
    }
  }

  // Final validation before fitting bounds
  if (
    minLng === undefined ||
    minLat === undefined ||
    maxLng === undefined ||
    maxLat === undefined ||
    isNaN(minLng) ||
    isNaN(minLat) ||
    isNaN(maxLng) ||
    isNaN(maxLat) ||
    !isFinite(minLng) ||
    !isFinite(minLat) ||
    !isFinite(maxLng) ||
    !isFinite(maxLat)
  ) {
    console.error("Invalid bounds for fitBounds", {
      minLng,
      minLat,
      maxLng,
      maxLat,
    });
    return;
  }

  try {
    // Add padding to ensure coordinates are valid
    const padding = 0.0075;
    const bounds: mapboxgl.LngLatBoundsLike = [
      [minLng - padding, minLat - padding],
      [maxLng + padding, maxLat + padding],
    ];

    // Validate each coordinate in the bounds array
    if (
      bounds.some(
        (coord) =>
          Array.isArray(coord) &&
          coord.some(
            (value) =>
              value === null ||
              value === undefined ||
              isNaN(value) ||
              !isFinite(value),
          ),
      )
    ) {
      console.error("Invalid values in bounds array", bounds);
      return;
    }

    // If on mobile, use a large bottom padding to push the route up to the upper part of the map
    if (props.isMobile) {
      props.map.fitBounds(bounds, {
        padding: {
          top: 60,
          bottom: 300, // Large bottom padding to push content up
          left: 40,
          right: 40,
        },
      });
    } else {
      props.map.fitBounds(bounds, { padding: 20 });
    }
  } catch (error) {
    console.error("Error fitting bounds:", error);
  }
};

export function useGetDirections({
  points,
  map,
}: {
  points: [number, number][];
  map: mapboxgl.Map;
}) {
  const query = trpc.mapbox.getDirections.useQuery(
    {
      points: points,
    },
    {
      onSuccess: (response) => {
        const coordinates = response.routes[0].geometry;

        // Decode the encoded polyline into an array of coordinates
        const decodedCoordinates = polyline.decode(coordinates);

        // Convert the decoded coordinates into GeoJSON format
        const geoJsonCoordinates = decodedCoordinates.map(([lat, lon]) => [
          lon,
          lat,
        ]);

        // Create a GeoJSON LineString feature
        const lineStringFeature: GeoJSON.Feature<
          GeoJSON.LineString,
          GeoJSON.GeoJsonProperties
        > = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: geoJsonCoordinates,
          },
          properties: {},
        };

        if (map.getLayer("route")) {
          const source = map.getSource("route") as mapboxgl.GeoJSONSource;
          source.setData(lineStringFeature);
        } else {
          // Try different layer positions - let's find one that works
          let beforeLayerId = "";
          
          // Try to find a good layer to place the route above
          const layerIds = [
            "road-label",           // Above road labels
            "waterway-label",       // Above water labels  
            "natural-label",        // Above natural feature labels
            "poi-label",            // Above point of interest labels
            "transit-label",        // Above transit labels
          ];

          // Find the first existing layer to place the route above
          for (const layerId of layerIds) {
            if (map.getLayer(layerId)) {
              beforeLayerId = layerId;
              break;
            }
          }

          // If no specific layer found, use a safe default
          if (!beforeLayerId) {
            // Place above base map layers but below markers
            beforeLayerId = "background";
          }

          map.addLayer(
            {
              id: "route",
              type: "line",
              source: {
                type: "geojson",
                data: lineStringFeature,
              },
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#4a89f3",
                "line-width": 6,
              },
            },
            beforeLayerId
          );
        }
      },
      onError: (error) => {
        toast.error(`Something went wrong: ${error}`);
      },
      enabled: false,
      retry: false,
    },
  );
  useEffect(() => {
    // ensures that we don't run on page load
    if (points.length !== 0 && map !== undefined) {
      query.refetch();
    }
  }, [points, map, query]);
}
