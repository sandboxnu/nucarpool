import mapboxgl from "mapbox-gl";
import { PublicUser, User } from "../types";

const previousMarkers: mapboxgl.Marker[] = [];
const clearMarkers = () => {
  previousMarkers.forEach((marker) => marker.remove());
  previousMarkers.length = 0;
};

// Creates MapBox markers showing user's start address and the start area of the other user.
export const viewRoute = (
  user: User,
  otherUser: PublicUser,
  map: mapboxgl.Map
) => {
  clearMarkers();

  const selfStartMarker = new mapboxgl.Marker({ color: "#00008B" })
    .setLngLat([user.startPOICoordLng, user.startPOICoordLat])
    .addTo(map);

  const selfEndMarker = new mapboxgl.Marker({ color: "#FFA500" })
    .setLngLat([user.companyPOICoordLng, user.companyPOICoordLat])
    .addTo(map);

  const otherUserStartMarker = new mapboxgl.Marker({ color: "#2ae916" })
    .setLngLat([otherUser.startPOICoordLng, otherUser.startPOICoordLat])
    .addTo(map);

  const otherUserEndMarker = new mapboxgl.Marker({ color: "#f0220f" })
    .setLngLat([otherUser.companyPOICoordLng, otherUser.companyPOICoordLat])
    .addTo(map);

  previousMarkers.push(selfStartMarker);
  previousMarkers.push(selfEndMarker);
  previousMarkers.push(otherUserStartMarker);
  previousMarkers.push(otherUserEndMarker);

  map.fitBounds([
    [
      Math.min(otherUser.startPOICoordLng, otherUser.companyPOICoordLng) -
        0.125,
      Math.max(otherUser.startPOICoordLat, otherUser.companyPOICoordLat) + 0.05,
    ],
    [
      Math.max(otherUser.startPOICoordLng, otherUser.companyPOICoordLng) + 0.05,
      Math.min(otherUser.startPOICoordLat, otherUser.companyPOICoordLat) - 0.05,
    ],
  ]);
};
