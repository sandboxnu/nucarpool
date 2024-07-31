import {
  GeoJSONSource,
  Map,
  MapLayerMouseEvent,
  NavigationControl,
} from "mapbox-gl";
import { PublicUser } from "../types";
import { User } from "../types";
import { Dispatch, SetStateAction } from "react";

const addMapEvents = (
  map: Map,
  user: User,
  setPopupUser: Dispatch<SetStateAction<PublicUser | null>>
) => {
  map.addControl(new NavigationControl(), "bottom-right");

  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0]!.properties!.cluster_id;
    const source = map.getSource("company-locations") as GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      if (features[0]!.geometry.type === "Point") {
        map.easeTo({
          center: [
            features[0]!.geometry.coordinates[0]!,
            features[0]!.geometry.coordinates[1]!,
          ],
          zoom: zoom,
        });
      }
    });
  });
  function handlePointClick(e: MapLayerMouseEvent) {
    if (!e.features) return;
    if (e.features[0]!.geometry.type != "Point") return;

    const coordinates = e.features[0]!.geometry.coordinates;
    const otherUser = e.features[0]!.properties as PublicUser;

    while (Math.abs(e.lngLat.lng - coordinates[0]!) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0]! ? 360 : -360;
    }
    setPopupUser(otherUser);
  }

  map.on("click", "riders", handlePointClick);
  map.on("click", "drivers", handlePointClick);

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });

  document.getElementById("fly")!.addEventListener("click", () => {
    map.flyTo({
      center: [user.companyCoordLng, user.companyCoordLat],
      essential: true,
    });
  });
};

export default addMapEvents;
