import Rating from "@mui/material/Rating";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ButtonInfo, EnhancedPublicUser, PublicUser } from "../../utils/types";
import { trpc } from "../../utils/trpc";
import { toast } from "react-toastify";
import { useContext } from "react";
import { UserContext } from "../../utils/userContext";
import Spinner from "../Spinner";
import { classNames } from "../../utils/classNames";
import { User } from "@prisma/client";
import { ConnectCard } from "./ConnectCard";
import { SentCard } from "./SentCard";
import { ReceivedCard } from "./ReceivedCard";

interface AbstractUserCardProps {
  otherUser: EnhancedPublicUser;
  rightButton: ButtonInfo;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}

export const renderUserCard = (
  cardType: string,
  otherUser: EnhancedPublicUser,
  onViewRouteClick: (user: User, otherUser: PublicUser) => void
): JSX.Element => {
  switch (cardType) {
    case "recommendations":
    case "favorites":
      return (
        <ConnectCard
          otherUser={otherUser}
          onViewRouteClick={onViewRouteClick}
        />
      );
    case "sent":
      if (otherUser.outgoingRequest) {
        return (
          <SentCard otherUser={otherUser} onViewRouteClick={onViewRouteClick} />
        );
      }
    case "received":
      if (otherUser.incomingRequest) {
        return (
          <ReceivedCard
            otherUser={otherUser}
            onViewRouteClick={onViewRouteClick}
          />
        );
      }
    default:
      return <Spinner />;
  }
};

const backgroundColorCSS = (seatAvail: number): string => {
  if (seatAvail === 1) {
    return " bg-busy-red";
  } else if (seatAvail === 2) {
    return " bg-okay-yellow";
  } else {
    return " bg-good-green";
  }
};

const borderLColorCSS = (seatAvail: number): string => {
  if (seatAvail === 1) {
    return " border-l-busy-red";
  } else if (seatAvail === 2) {
    return " border-l-okay-yellow";
  } else {
    return " border-l-good-green";
  }
};

const getButtonClassName = (button: ButtonInfo): string => {
  const bColor = button.color;
  return classNames(
    `${bColor} w-1/2 hover:${
      bColor === "bg-northeastern.red" ? "bg-red-700" : "bg-sky-900"
    } rounded-md p-1 my-1 text-center text-white`
  );
};

export const AbstractUserCard = (props: AbstractUserCardProps): JSX.Element => {
  const trpcUtils = trpc.useContext();
  const { mutate: mutateFavorites } = trpc.user.favorites.edit.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      trpcUtils.user.favorites.me.invalidate();
    },
  });
  const user = useContext(UserContext);
  const handleFavorite = (favoriteId: string, add: boolean) => {
    if (user) {
      mutateFavorites({
        userId: user.id,
        favoriteId,
        add,
      });
    }
  };

  dayjs.extend(utc);
  dayjs.extend(timezone);

  /** Creates a div with 7 boxes, each representing a day of the week.
   *  Background color is green if the user is working on that day.
   */
  const DaysWorkingDisplay = (daysWorking: string) => {
    const boxes: JSX.Element[] = [];
    const days: string[] = ["S", "M", "T", "W", "Th", "F", "Sa"];
    for (let i = 0; i < daysWorking.length; i = i + 2) {
      let backgroundColor = "";
      let dayIndex = Math.floor(i / 2);
      if (daysWorking[i] == "1") {
        backgroundColor = " bg-good-green";
      }
      boxes.push(
        <div
          key={i}
          className={
            "w-6 h-6 border-l-0 border border-black text-center font-heavy text-sm pl-auto pt-0.5" +
            backgroundColor
          }
        >
          {days[dayIndex]}
        </div>
      );
    }
    return <div className="flex border-l border-black h-min">{boxes}</div>;
  };

  if (!user) {
    return <Spinner />;
  }

  return (
    <div
      className={
        "bg-stone-100 text-left px-6 py-4 rounded-xl m-3.5 align-center flex flex-col border-l-[13px] gap-2 shadow-md" +
        borderLColorCSS(props.otherUser.seatAvail)
      }
    >
      <div className="flex justify-between">
        {/* top row */}
        <div className="flex">
          <div className="text-lg">
            <p className="font-semibold">{props.otherUser.name}</p>
            <p className="font-light">{props.otherUser.companyName}</p>
          </div>
        </div>
        <Rating
          name=""
          size="large"
          onChange={(_, value) => handleFavorite(props.otherUser.id, !!value)}
          value={props.otherUser.isFavorited ? 1 : 0}
          max={1}
        />
      </div>
      {/* second row */}
      <p className="font-semibold">{props.otherUser.startPOILocation}</p>
      {/* third row */}
      <div className="w-full flex gap-4 items-center">
        {DaysWorkingDisplay(props.otherUser.daysWorking)}
        {props.otherUser.role === "DRIVER" && (
          <div
            className={
              "w-7 h-7 flex justify-center items-center rounded-md font-semibold" +
              backgroundColorCSS(props.otherUser.seatAvail)
            }
          >
            {props.otherUser.seatAvail}
          </div>
        )}
      </div>
      {/* fourth row */}
      <div className="w-full m-0 flex justify-between align-middle">
        <div className="font-normal text-sm flex">
          <p className="pr-1">Start:</p>
          <p className="font-semibold">
            {dayjs.tz(props.otherUser.startTime, "UTC").format("h:mm")} am
          </p>
          <p className="font-semibold px-2"> | </p>
          <p className="pr-1">End:</p>
          <p className="font-semibold">
            {dayjs.tz(props.otherUser.endTime, "UTC").format("h:mm")} pm
          </p>
        </div>
      </div>
      {/* last row */}
      <div className="flex flex-row gap-2 justify-between">
        <button
          onClick={() => props.onViewRouteClick(user, props.otherUser)}
          className="w-1/2 hover:bg-stone-200 rounded-md p-1 my-1 text-center border-black border"
        >
          View Route
        </button>
        <button
          onClick={() => props.rightButton.onPress(props.otherUser)}
          className={getButtonClassName(props.rightButton)}
        >
          {props.rightButton.text}
        </button>
      </div>
    </div>
  );
};
