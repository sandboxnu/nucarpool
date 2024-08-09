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
      switch (visibility) {
        case "ALL":
          map.setLayoutProperty("riders", "visibility", "visible");
          map.setLayoutProperty("drivers", "visibility", "visible");
          break;
        case "RIDERS":
          map.setLayoutProperty("riders", "visibility", "visible");
          map.setLayoutProperty("drivers", "visibility", "none");
          break;
        case "DRIVERS":
          map.setLayoutProperty("riders", "visibility", "none");
          map.setLayoutProperty("drivers", "visibility", "visible");
          break;
        default:
          console.error("Unexpected visibility state");
      }
    };

    // Ensure style is loaded before setting layout properties
    if (map.isStyleLoaded()) {
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
