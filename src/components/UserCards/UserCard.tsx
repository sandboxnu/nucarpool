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
import StartIcon from "../../../public/start.png";
import EndIcon from "../../../public/end.png";
import Image from "next/image";

interface UserCardProps {
  otherUser: EnhancedPublicUser;
  rightButton: ButtonInfo;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  message: string;
}

const getButtonClassName = (button: ButtonInfo): string => {
  const bColor = button.color;
  return classNames(
    `${bColor} w-1/2 hover:${
      bColor === "bg-northeastern.red"
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
    const days: string[] = ["S", "M", "Tu", "W", "Th", "F", "Sa"];
    for (let i = 0; i < daysWorking.length; i = i + 2) {
      let backgroundColor = "";
      let textColor = "";
      let dayIndex = Math.floor(i / 2);
      if (daysWorking[i] == "1") {
        backgroundColor = " bg-red-500";
        textColor = " text-white";
      }
      boxes.push(
        <div
          key={i}
          className={
            "flex h-7 w-7 items-center justify-center rounded-full border border-black text-sm" +
            backgroundColor +
            textColor
          }
        >
          {days[dayIndex]}
        </div>
      );
    }
    return <div className="flex gap-2">{boxes}</div>;
  };

  if (!user) {
    return <Spinner />;
  }
  return (
    <div
      className={
        "align-center m-3.5 flex flex-col gap-2 rounded-xl border-l-[13px] border-l-busy-red bg-stone-100 px-6 py-4 text-left shadow-md"
      }
    >
      <div className="flex justify-between">
        {/* top row - Username*/}

        {/* Profile picture goes here */}
        <div className="flex">
          <div className="text-lg">
            {user.role === "VIEWER" ? (
              <p className="font-semibold">{`${props.otherUser.role.charAt(
                0
              )}${props.otherUser.role.slice(1).toLowerCase()}`}</p>
            ) : (
              <p className="font-semibold">{props.otherUser.preferredName}</p>
            )}
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
      {/* second row - Start location*/}

      <div className="flex items-center">
        <div className="flex w-7 items-center justify-center">
          <Image src={StartIcon} width={25} height={25} alt="Start icon" />
        </div>
        <p className="ml-2 text-sm font-semibold">
          {props.otherUser.startPOILocation}
        </p>
      </div>

      {/* third row - End location*/}
      <div className="flex items-center">
        <div className="flex w-7 items-center justify-center">
          <Image src={EndIcon} width={21} height={25} alt="End icon" />
        </div>
        <p className="ml-2 text-sm font-semibold">
          {props.otherUser.companyName}
        </p>
      </div>


      {/* Fourth row - messaging bubble */}
      {props.message && (
          <div className="mt-2 w-full rounded-lg bg-gray-200 p-2 text-sm">
            {props.message}
          </div>
        )} 

      <div className="flex w-full items-center gap-4">
        {DaysWorkingDisplay(props.otherUser.daysWorking)}
      </div>

      {/* Fifth row - Start and end times */}

      <div className="m-0 flex w-full justify-between align-middle">
        <div className="flex text-sm font-normal">
          <p className="pr-1">Start:</p>
          <p className="font-semibold">
            {dayjs.tz(props.otherUser.startTime, "UTC").format("h:mm")} am
          </p>
          <p className="px-2 font-semibold">|</p>
          <p className="pr-1">End:</p>
          <p className="font-semibold">
            {dayjs.tz(props.otherUser.endTime, "UTC").format("h:mm")} pm
          </p>
        </div>
      </div>

      {/* Sixth row - Seats avaliable*/}

      {props.otherUser.role === "DRIVER" && (
        <div className="flex flex-row text-sm">
          <div className="mr-1">Seats Available: </div>
          <div className="font-semibold">{props.otherUser.seatAvail}</div>
        </div>
      )}


      {/* Seventh row - Buttons*/}

      <div className="flex flex-row justify-between gap-2">
        <button
          onClick={() => props.onViewRouteClick(user, props.otherUser)}
          className="my-1 w-1/2 rounded-md border border-black p-1 text-center hover:bg-stone-200"
        >
          View Route
        </button>
        <button
          onClick={() => props.rightButton.onPress(props.otherUser)}
          disabled={user.role === "VIEWER" || user.status === "INACTIVE"}
          className={getButtonClassName(props.rightButton)}
        >
          {props.rightButton.text}
        </button>
      </div>
    </div>
  );
};
