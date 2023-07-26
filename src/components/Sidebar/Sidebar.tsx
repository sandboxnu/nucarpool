import { Dispatch, useState } from "react";
import { SidebarStateProps } from "../../utils/reducerFuncs";
import ExploreSidebar from "./ExploreSidebar";
import RequestSidebar from "./RequestSidebar";
import { PublicUser } from "../../utils/types";

interface SidebarProps {
  sidebarType: string;
  reccomendations: PublicUser[];
  favorites: PublicUser[];
  sent: PublicUser[];
  received: PublicUser[];
}

export type EnhancedPublicUser = PublicUser & {
  isFavorited: boolean;
  incomingRequest: boolean;
};

export const SidebarPage = (props: SidebarProps) => {
  const extendPublicUser = (user: PublicUser): EnhancedPublicUser => {
    return {
      ...user,
      isFavorited: props.favorites.some((favs) => favs.id === user.id),
      incomingRequest: props.received.some((req) => req.id === user.id),
    };
  };

  const enhancedRecs = props.reccomendations.map((user) =>
    extendPublicUser(user)
  );
  if (props.sidebarType === "explore") {
    return <ExploreSidebar />;
  } else {
    return <RequestSidebar />;
  }
};

const AbstractSidebarPage = (props: AbstractSidebarPageProps) => {
  const [curList, setCurList] = useState<PublicUser[]>(
    props.userCardList ?? []
  );

  useEffect(() => {
    setCurList(props.userCardList ?? []);
  }, [props.userCardList]);

  const favIds = props.favs.map((fav) => fav.id);

  return (
    <div id="scrollableDiv" className="overflow-auto">
      {curList.length > 0 &&
        curList.map((otherUser: PublicUser) => (
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
              // We can use dispatch to reduce prop drilling here
              map: props.map, // All of this
              previousMarkers: previousMarkers,
              clearMarkers: clearMarkers,
            }}
          />
        ))}
      {props.emptyMessage && curList.length === 0 && (
        <div className="text-center text-lg font-light m-4">
          {props.emptyMessage}
        </div>
      )}
    </div>
  );
};

export default AbstractSidebarPage;
