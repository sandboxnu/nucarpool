import mapboxgl, {
  GeoJSONSource,
  Map,
  MapboxGeoJSONFeature,
  MapLayerMouseEvent,
  NavigationControl,
} from "mapbox-gl";
import { PublicUser } from "../types";
import { User } from "../types";
import { Dispatch, SetStateAction } from "react";
import { GeoJSON } from "geojson";

const addMapEvents = (
  map: Map,
  user: User,
  setPopupUser: Dispatch<SetStateAction<PublicUser[] | null>>
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

    const pointFeatures = e.features.filter(
      (
        feature
      ): feature is MapboxGeoJSONFeature & { geometry: GeoJSON.Point } =>
        feature.geometry.type === "Point"
    );

    if (pointFeatures.length === 0) return;

    const users = pointFeatures.map(
      (feature) => feature.properties as PublicUser
    );

    const coordinates = pointFeatures[0].geometry.coordinates.slice();
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    setPopupUser(users);
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
