import { GeoJSONSource, Map, NavigationControl, Popup } from "mapbox-gl";
import { createRoot } from "react-dom/client";
import CustomPopUp from "../../components/CustomPopUp";
import { PublicUser } from "../types";
import { User } from "../types";

const addMapEvents = (map: Map, user: User) => {
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

  map.on("click", "unclustered-point", (e) => {
    if (!e.features) return;
    if (e.features[0]!.geometry.type != "Point") return;

    const coordinates = e.features[0]!.geometry.coordinates;
    const properties = e.features[0]!.properties as PublicUser;

    while (Math.abs(e.lngLat.lng - coordinates[0]!) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0]! ? 360 : -360;
    }
    const popupNode = document.createElement("div");
    const root = createRoot(popupNode);
    root.render(<CustomPopUp {...properties} />);

    new Popup({ closeButton: false, maxWidth: "75%" })
      .setLngLat(e.lngLat)
      .setDOMContent(popupNode)
      .addTo(map);
  });

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
