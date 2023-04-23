import { GeoJSONSource, Map, NavigationControl, Popup } from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { PublicUser } from "../types";
import { User } from "../types";
import UserCard from "../../components/UserCard";

const previousMarkers: mapboxgl.Marker[] = [];
const clearMarkers = () => {
  previousMarkers.forEach((marker) => marker.remove());
  previousMarkers.length = 0;
};

const addMapEvents = ({
  map,
  user,
  favorites,
  handleFavorite,
  handleConnect,
}: {
  map: Map;
  user: User;
  favorites: PublicUser[] | undefined;
  handleConnect: (modalUser: PublicUser) => void;
  handleFavorite: (otherUser: string, add: boolean) => void;
}) => {
  console.log({
    map,
    user,
    favs: favorites,
    handleFavorite,
    handleConnect,
  });
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
    const targetUser = e.features[0]!.properties as PublicUser;

    while (Math.abs(e.lngLat.lng - coordinates[0]!) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0]! ? 360 : -360;
    }
    const popupNode = document.createElement("div");

    const root = createRoot(popupNode);
    root.render(
      <UserCard
        userToConnectTo={targetUser}
        inputProps={{
          map,
          previousMarkers: previousMarkers,
          clearMarkers: clearMarkers,
        }}
        isFavorited={
          favorites?.map((fav) => fav.id.toString()).includes(targetUser.id) ??
          false
        }
        handleConnect={handleConnect}
        handleFavorite={(add) => handleFavorite(targetUser.id, add)}
      />
    );

    new Popup({
      closeButton: false,
      maxWidth: "75%",
      className: "custom-map-popup",
    })
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
