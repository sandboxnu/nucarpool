import mapboxgl from "mapbox-gl";

const clearRiderStartMarkers = (map: mapboxgl.Map): void => {
  const style = map.getStyle();
  
  if (!style || !style.layers) return;

  const riderStartMarkerLayers = style.layers.filter(layer => 
    layer.id.includes('-start-layer') && !layer.id.includes('driver')
  );

  // remove layer
  riderStartMarkerLayers.forEach(layer => {
    if (map.getLayer(layer.id)) {
      map.removeLayer(layer.id);
    }

    // remove source
    const sourceId = layer.id.replace('-layer', '-source');
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    // remove image
    const imageId = `${sourceId}-image`;
    if (map.hasImage(imageId)) {
      map.removeImage(imageId);
    }
  });
};

export default clearRiderStartMarkers;