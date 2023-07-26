import { useState } from "react";
import ExploreSidebar from "./ExploreSidebar";
import RequestSidebar from "./RequestSidebar";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import mapboxgl from "mapbox-gl";
import { viewRoute } from "../../utils/map/viewRoute";
import { extend } from "lodash";

interface SidebarProps {
  sidebarType: string;
  reccomendations: PublicUser[];
  favorites: PublicUser[];
  sent: PublicUser[];
  received: PublicUser[];
  map: mapboxgl.Map;
}

export const SidebarPage = (props: SidebarProps) => {
  // Creates MapBox markers showing user's start address and the start area of the other user.
  const extendPublicUser = (user: PublicUser): EnhancedPublicUser => {
    return {
      ...user,
      isFavorited: props.favorites.some((favs) => favs.id === user.id),
      incomingRequest: props.received.some((req) => req.id === user.id),
    };
  };

  const extendPublicUserArray = (users: PublicUser[]): EnhancedPublicUser[] => {
    return users.map(extendPublicUser);
  };

  const enhancedRecs = extendPublicUserArray(props.reccomendations);
  const enhancedFavs = extendPublicUserArray(props.favorites);
  const enhancedSent = extendPublicUserArray(props.sent);
  const enhancedReceived = extendPublicUserArray(props.received);

  const onViewRouteClick = (user: User, otherUser: PublicUser) => {
    return viewRoute(user, otherUser, props.map);
  };

  if (props.sidebarType === "explore") {
    return (
      <ExploreSidebar
        recs={enhancedRecs}
        favs={enhancedFavs}
        viewRoute={onViewRouteClick}
      />
    );
  }
  // else {
  //   return <RequestSidebar/>
  // }
};

// const AbstractSidebarPage = (props: AbstractSidebarPageProps) => {
//   const [curList, setCurList] = useState<PublicUser[]>(
//     props.userCardList ?? []
//   );

//   useEffect(() => {
//     setCurList(props.userCardList ?? []);
//   }, [props.userCardList]);

//   const favIds = props.favs.map((fav) => fav.id);

//   return (
//     <div id="scrollableDiv" className="overflow-auto">
//       {curList.length > 0 &&
//         curList.map((otherUser: PublicUser) => (
//           <AbstractUserCard
//             userCardObj={otherUser}
//             key={otherUser.id}
//             isFavorited={favIds.includes(otherUser.id)}
//             handleFavorite={(add: boolean) =>
//               props.handleFavorite(otherUser.id, add)
//             }
//             leftButton={props.leftButton}
//             rightButton={props.rightButton}
//             inputProps={{ // We can use dispatch to reduce prop drilling here
//               map: props.map, // All of this
//               previousMarkers: previousMarkers,
//               clearMarkers: clearMarkers,
//             }}
//           />
//         ))}
//       {props.emptyMessage && curList.length === 0 && (
//         <div className="text-center text-lg font-light m-4">
//           {props.emptyMessage}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AbstractSidebarPage;
