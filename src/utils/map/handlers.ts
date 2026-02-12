import { MapLayerMouseEvent } from "mapbox-gl";
import { PublicUser } from "../types";
import { Dispatch, SetStateAction } from "react";

let handlePointClick: ((e: MapLayerMouseEvent) => void) | null = null;

export const setPointClickHandler = (handler: (e: MapLayerMouseEvent) => void) => {
  handlePointClick = handler;
};

export const getPointClickHandler = () => {
  return handlePointClick;
};

export const createPointClickHandler = (
  setPopupUser: Dispatch<SetStateAction<PublicUser[] | null>>
) => {
  return (e: MapLayerMouseEvent) => {
    if (!e.features) return;
    const allPointLayers = e.target.getStyle().layers
      .filter(layer => layer.type === 'symbol')
      .map(layer => layer.id);
    const pointFeatures = e.target.queryRenderedFeatures(e.point, { layers: allPointLayers });

    if (pointFeatures.length === 0) return;

    const users = pointFeatures.map(
      (feature) => feature.properties as PublicUser,
    );

    setPopupUser(users);
  };
};