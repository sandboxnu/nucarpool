import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ButtonInfo, PublicUser, User } from "../utils/types";
import { AbstractUserCard } from "./AbstractUserCard";

/**
 * TODO:
 * 2. Add Prettier Tailwind omg please
 * 5. onClick StarButton with Favorites
 */

const previousMarkers: mapboxgl.Marker[] = [];
const clearMarkers = () => {
  previousMarkers.forEach((marker) => marker.remove());
  previousMarkers.length = 0;
};

interface AbstractSidebarPageProps {
  currentUser: User;
  userCardList: PublicUser[];
  favs: PublicUser[];
  leftButton?: ButtonInfo;
  rightButton: ButtonInfo;
  handleFavorite: (otherUser: string, add: boolean) => void;
  map: mapboxgl.Map;
}

const AbstractSidebarPage = (props: AbstractSidebarPageProps) => {
  const [curList, setCurList] = useState<PublicUser[]>(
    props.userCardList ?? []
  );

  useEffect(() => {
    setCurList(props.userCardList ?? []);
  }, [props.userCardList]);

  const favIds = props.favs.map((fav) => fav.id);

  console.log(props.rightButton);

  return (
    <div id="scrollableDiv" className="overflow-auto">
      {curList.map((otherUser: PublicUser) => (
        <AbstractUserCard
          userCardObj={otherUser}
          key={otherUser.id}
          isFavorited={favIds.includes(otherUser.id)}
          handleFavorite={(add: boolean) =>
            props.handleFavorite(otherUser.id, add)
          }
          leftButton={props.leftButton}
          rightButton={props.rightButton}
          inputProps={{
            map: props.map,
            previousMarkers: previousMarkers,
            clearMarkers: clearMarkers,
          }}
        />
      ))}
    </div>
  );
};

export default AbstractSidebarPage;
