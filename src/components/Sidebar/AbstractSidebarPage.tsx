import React, { Dispatch, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ButtonInfo, PublicUser, User } from "../../utils/types";
import { AbstractUserCard } from "../UserCards/AbstractUserCard";
import { SidebarStateProps } from "../../utils/reducerFuncs";
import ExploreSidebar from "./ExploreSidebar";

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
  handleFavorite: (otherUser: string, add: boolean) => void;
  map: mapboxgl.Map;
  emptyMessage?: string;
}

interface SidebarProps {
  sidebarType: string;
  sidebarState: SidebarStateProps;
  sidebarDispatch: Dispatch<any>;
}

// const Sidebar = (props: SidebarProps) => {
//   switch (props.sidebarType) {
//     case "explore":
//       return
//       <ExploreSidebar

//   }
// };

interface SidebarContentProps {
  userCardList: PublicUser[];
  emptyMessage: String;
  cardType: JSX.Element;
}

// props.userCardList.map((otherUser: PublicUser) => (
//   <AbstractUserCard
//     userCardObj={otherUser}
//     key={otherUser.id}
//     isFavorited={favIds.includes(otherUser.id)}
//     handleFavorite={(add: boolean) =>
//       props.handleFavorite(otherUser.id, add)
//     }
//     leftButton={props.leftButton}
//     rightButton={props.rightButton}
//     inputProps={{ // We can use dispatch to reduce prop drilling here
//       map: props.map, // All of this
//       previousMarkers: previousMarkers,
//       clearMarkers: clearMarkers,
//     }}
//   />
const SidebarContent = (props: SidebarContentProps) => {
  return (
    <div id="scrollableDiv" className="overflow-auto">
      {props.userCardList.length == 0 ? (
        <div className="text-center text-lg font-light m-4">
          {props.emptyMessage}
        </div>
      ) : (
        <div>Test</div>
      )}
    </div>
  );
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
