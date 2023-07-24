import { trpc } from "./trpc";
import { PublicUser } from "./types";
import { ReducerStateWithoutAction, useReducer } from "react";

export interface SidebarStateProps {
  recommendations: PublicUser[];
  favorites: PublicUser[];
  sent: PublicUser[];
  received: PublicUser[];
}

export interface ModalStateProps {}

export const sidebarReducer = (state: any, action: any) => {
  switch (action.type) {
    case action.type === "test":
      return { ...state, recommendations: [] };
  }
};

export const modalReducer = (modalState: ModalStateProps, action: any) => {};
