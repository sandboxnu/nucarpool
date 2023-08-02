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

interface UserCardProps {
  otherUser: EnhancedPublicUser;
  rightButton: ButtonInfo;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}

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

export const UserCard = (props: UserCardProps): JSX.Element => {
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
            "font-heavy pl-auto h-6 w-6 border border-l-0 border-black pt-0.5 text-center text-sm" +
            backgroundColor
          }
        >
          {days[dayIndex]}
        </div>
      );
    }
    return <div className="flex h-min border-l border-black">{boxes}</div>;
  };

  if (!user) {
    return <Spinner />;
  }

  console.log(props.otherUser.preferredName);
  return (
    <div
      className={
        "align-center m-3.5 flex flex-col gap-2 rounded-xl border-l-[13px] bg-stone-100 px-6 py-4 text-left shadow-md" +
        borderLColorCSS(props.otherUser.seatAvail)
      }
    >
      <div className="flex justify-between">
        {/* top row */}
        <div className="flex">
          <div className="text-lg">
            <p className="font-semibold">{props.otherUser.preferredName}</p>
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
      <div className="flex w-full items-center gap-4">
        {DaysWorkingDisplay(props.otherUser.daysWorking)}
        {props.otherUser.role === "DRIVER" && (
          <div
            className={
              "flex h-7 w-7 items-center justify-center rounded-md font-semibold" +
              backgroundColorCSS(props.otherUser.seatAvail)
            }
          >
            {props.otherUser.seatAvail}
          </div>
        )}
      </div>
      {/* fourth row */}
      <div className="m-0 flex w-full justify-between align-middle">
        <div className="flex text-sm font-normal">
          <p className="pr-1">Start:</p>
          <p className="font-semibold">
            {dayjs.tz(props.otherUser.startTime, "UTC").format("h:mm")} am
          </p>
          <p className="px-2 font-semibold"> | </p>
          <p className="pr-1">End:</p>
          <p className="font-semibold">
            {dayjs.tz(props.otherUser.endTime, "UTC").format("h:mm")} pm
          </p>
        </div>
      </div>
      {/* last row */}
      <div className="flex flex-row justify-between gap-2">
        <button
          onClick={() => props.onViewRouteClick(user, props.otherUser)}
          className="my-1 w-1/2 rounded-md border border-black p-1 text-center hover:bg-stone-200"
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
