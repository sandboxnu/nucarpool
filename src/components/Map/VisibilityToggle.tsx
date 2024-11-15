import React, { useState, useEffect, CSSProperties } from "react";
import mapboxgl from "mapbox-gl";
interface VisibilityToggleProps {
  map: mapboxgl.Map | undefined;
  className?: string;
  style?: CSSProperties;
}

const VisibilityToggle = ({ map, style }: VisibilityToggleProps) => {
  const [visibility, setVisibility] = useState("ALL");

  useEffect(() => {
    if (!map) return;

    // Function to update layer visibility
    const updateVisibility = () => {
      const layerIds = ["riders", "drivers"];

      layerIds.forEach((layer) => {
        if (map.getLayer(layer)) {
          if (visibility === "ALL") {
            map.setLayoutProperty(layer, "visibility", "visible");
          } else if (visibility === "RIDERS" && layer === "riders") {
            map.setLayoutProperty("riders", "visibility", "visible");
            map.setLayoutProperty("drivers", "visibility", "none");
          } else if (visibility === "DRIVERS" && layer === "drivers") {
            map.setLayoutProperty("riders", "visibility", "none");
            map.setLayoutProperty("drivers", "visibility", "visible");
          }
        } else {
          console.warn(`Layer ${layer} does not exist in the map's style.`);
        }
      });
    };

    // Ensure style is loaded before setting layout properties
    if (map.isStyleLoaded()) {
      console.log(map.isStyleLoaded());
      updateVisibility();
    } else {
      map.on("style.load", updateVisibility);
      // Clean up the event listener
      return () => {
        map.off("style.load", updateVisibility);
      };
    }
  }, [visibility, map]);

  return (
    <select
      style={style}
      value={visibility}
      onChange={(e) => setVisibility(e.target.value)}
    >
      <option value="ALL">All</option>
      <option value="RIDERS">Riders</option>
      <option value="DRIVERS">Drivers</option>
    </select>
  );
};

export default VisibilityToggle;
