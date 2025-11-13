import mapboxgl, {
  GeoJSONSource,
  Map,
  MapLayerMouseEvent,
  NavigationControl,
} from "mapbox-gl";
import { PublicUser } from "../types";
import { User } from "../types";
import { Dispatch, SetStateAction } from "react";
import { setPointClickHandler, createPointClickHandler } from "./handlers";

const addMapEvents = (
  map: Map,
  user: User,
  setPopupUser: Dispatch<SetStateAction<PublicUser[] | null>>,
) => {
  map.addControl(new NavigationControl(), "bottom-right");

  const handlePointClick = createPointClickHandler(setPopupUser);
  setPointClickHandler(handlePointClick);

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

  map.on("click", (e) => {
    const allPointLayers = map.getStyle().layers
      .filter(layer => layer.type === 'symbol')
      .map(layer => layer.id);
    
    const pointFeatures = map.queryRenderedFeatures(e.point, { layers: allPointLayers });
    
    if (pointFeatures.length > 0 && handlePointClick) {
      handlePointClick(e as MapLayerMouseEvent);
    }
  });

  if (handlePointClick) {
    map.on("click", "riders", handlePointClick);
    map.on("click", "drivers", handlePointClick);
  }

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });

  document.getElementById("fly")?.addEventListener("click", () => {
    map.flyTo({
      center: [user.companyCoordLng, user.companyCoordLat],
      essential: true,
    });
  });
};

export default addMapEvents;