import mapboxgl from "mapbox-gl";
import { PublicUser, User } from "../types";
import { Role } from "@prisma/client";
import { trpc } from "../trpc";
import { useEffect } from "react";
import { toast } from "react-toastify";
import polyline from "@mapbox/polyline";
import { LineString } from "geojson";
import { StaticImageData } from "next/image";
import RedStart from "../../../public/red-circle.png";
import RedEnd from "../../../public/red-square.png";
import BlueEnd from "../../../public/blue-square.png";
import orangeCircle from "../../../public/orange-circle.png";

const previousMarkers: mapboxgl.Marker[] = [];
export const clearMarkers = () => {
  previousMarkers.forEach((marker) => marker.remove());
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

const createMarkerEl = (img: StaticImageData) => {
  const el = document.createElement("img");
  el.src = img.src;
  el.style.marginTop = "1em";
  return el;
};
// Creates MapBox markers showing user's start address and the start area of the other user.
export const viewRoute = (
  user: User,
  otherUser: PublicUser,
  map: mapboxgl.Map
) => {
  clearMarkers();
  clearDirections(map);

  const otherRole = user.role === Role.DRIVER ? "Rider" : "Driver";

  const redCircle = createMarkerEl(RedStart);
  redCircle.style.opacity = "0";
  const selfStartPopup = createPopup("My Start");
  const selfStartMarker = new mapboxgl.Marker({
    element: redCircle,
    anchor: "bottom",
  })
    .setLngLat([user.startCoordLng, user.startCoordLat])
    .setPopup(selfStartPopup)
    .addTo(map);

  const blueSquare = createMarkerEl(BlueEnd);
  const selfEndPopup = createPopup("My Dest.");
  const selfEndMarker = new mapboxgl.Marker({ element: blueSquare })
    .setLngLat([user.companyCoordLng, user.companyCoordLat])
    .setPopup(selfEndPopup)
    .addTo(map);

  const orangeStart = createMarkerEl(orangeCircle);
  const otherUserStartPopup = createPopup(otherRole + " Start");
  const otherUserStartMarker = new mapboxgl.Marker({ element: orangeStart })
    .setLngLat([otherUser.startPOICoordLng, otherUser.startPOICoordLat])
    .setPopup(otherUserStartPopup)
    .addTo(map);

  const redSquare = createMarkerEl(RedEnd);
  redSquare.style.opacity = "0";
  const otherUserEndPopup = createPopup(otherRole + " Dest.");
  const otherUserEndMarker = new mapboxgl.Marker({
    element: redSquare,
  })
    .setLngLat([otherUser.companyCoordLng, otherUser.companyCoordLat])
    .setPopup(otherUserEndPopup)
    .addTo(map);

  selfStartMarker.togglePopup();
  selfEndMarker.togglePopup();
  otherUserStartMarker.togglePopup();
  otherUserEndMarker.togglePopup();

  previousMarkers.push(selfStartMarker);
  previousMarkers.push(selfEndMarker);
  previousMarkers.push(otherUserStartMarker);
  previousMarkers.push(otherUserEndMarker);

  map.fitBounds([
    [
      Math.min(otherUser.startPOICoordLng, otherUser.companyCoordLng) - 0.0075,
      Math.max(otherUser.startPOICoordLat, otherUser.companyCoordLat) + 0.0075,
    ],
    [
      Math.max(otherUser.startPOICoordLng, otherUser.companyCoordLng) + 0.0075,
      Math.min(otherUser.startPOICoordLat, otherUser.companyCoordLat) - 0.0075,
    ],
  ]);
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
        const lineStringFeature: LineString = {
          coordinates: geoJsonCoordinates,
          type: "LineString",
        };

        map.on("load", () => {
          clearDirections(map);
        });

        map.addLayer({
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
            "line-color": "#61666b",
            "line-width": 6,
          },
        });
      },
      onError: (error) => {
        toast.error(`Something went wrong: ${error}`);
      },
      enabled: false,
      retry: false,
    }
  );
  useEffect(() => {
    // ensures that we don't run on page load
    if (points.length !== 0) {
      query.refetch();
    }
  }, [points]);
}
