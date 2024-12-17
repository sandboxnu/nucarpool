import Rating from "@mui/material/Rating";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ButtonInfo, EnhancedPublicUser, PublicUser } from "../../utils/types";
import { trpc } from "../../utils/trpc";
import { toast } from "react-toastify";
import React, { useContext } from "react";
import { UserContext } from "../../utils/userContext";
import Spinner from "../Spinner";
import { classNames } from "../../utils/classNames";
import { User } from "@prisma/client";
import StartIcon from "../../../public/start.png";
import EndIcon from "../../../public/end.png";
import Image from "next/image";
import { trackViewRoute } from "../../utils/mixpanel";
import useProfileImage from "../../utils/useProfileImage";
import { AiOutlineUser } from "react-icons/ai";

interface UserCardProps {
  otherUser: EnhancedPublicUser;
  rightButton?: ButtonInfo;
  onViewRouteClick?: (user: User, otherUser: PublicUser) => void;
  message?: string;
  isUnread?: boolean;
  classname?: string;
}

const getButtonClassName = (button: ButtonInfo): string => {
  const bColor = button.color;
  return classNames(
    `${bColor} w-1/2 hover:bg-red-700 rounded-md p-1 my-1 text-center text-white`
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
  const { profileImageUrl, imageLoadError } = useProfileImage(
    props.otherUser.id
  );

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
   *  Background color is red if the user is working on that day.
   */
  const DaysWorkingDisplay = (daysWorking: string) => {
    const boxes: JSX.Element[] = [];
    const days: string[] = ["S", "M", "Tu", "W", "Th", "F", "Sa"];
    for (let i = 0; i < daysWorking.length; i = i + 2) {
      let backgroundColor = "";
      let textColor = "";
      let dayIndex = Math.floor(i / 2);
      if (daysWorking[i] == "1") {
        backgroundColor = " bg-northeastern-red";
        textColor = " text-white";
      }
      boxes.push(
        <div
          key={i}
          className={
            "flex h-8 w-8 items-center justify-center rounded-full border border-black text-sm" +
            backgroundColor +
            textColor
          }
        >
          {days[dayIndex]}
        </div>
      );
    }
    return <div className="flex w-11/12 justify-between">{boxes}</div>;
  };

  if (!user) {
    return <Spinner />;
  }
  return (
    <div
      className={classNames(
        "align-center relative m-3.5 flex flex-col gap-2 rounded-xl bg-stone-100 px-4 py-4 text-left shadow-md",
        "border-l-[13px] border-l-busy-red font-montserrat ",
        props.classname
      )}
    >
      <div className={"-ml-2 mb-1 flex flex-row items-center"}>
        {/* Profile Image */}
        {profileImageUrl && !imageLoadError ? (
          <Image
            src={profileImageUrl}
            alt={`${props.otherUser.preferredName}'s Profile Image`}
            width={56}
            height={56}
            className="h-14 w-14  rounded-full object-cover"
          />
        ) : (
          <AiOutlineUser className="h-14 w-14  rounded-full bg-gray-200" />
        )}

        {/* Name and Pronouns */}
        <div className="flex flex-col items-start pl-3.5">
          <div className="text-lg font-semibold ">
            {user.role === "VIEWER" ? (
              <p>{`${props.otherUser.role.charAt(0)}${props.otherUser.role
                .slice(1)
                .toLowerCase()}`}</p>
            ) : (
              <p>{props.otherUser.preferredName}</p>
            )}
          </div>
          <div className="flex flex-row items-start gap-4">
            <p className="font-montserrat text-sm  italic">
              {props.otherUser.pronouns !== ""
                ? "(" + `${props.otherUser.pronouns}` + ")"
                : null}
            </p>

            {props.isUnread && (
              <div className="flex items-center">
                <span className="mr-1 h-2 w-2 rounded-full bg-blue-300"></span>
                <p className="text-sm italic ">New!</p>
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="ml-auto">
          <Rating
            name=""
            size="large"
            onChange={(_, value) => handleFavorite(props.otherUser.id, !!value)}
            value={props.otherUser.isFavorited ? 1 : 0}
            max={1}
          />
        </div>
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
        <div
          className={`mt-2 inline-block max-w-full break-words rounded-lg bg-white p-2 text-sm ${
            props.isUnread ? "font-bold" : ""
          }`}
        >
          {props.message}
        </div>
      )}

      <div className="flex w-full items-center gap-4">
        {DaysWorkingDisplay(props.otherUser.daysWorking)}
      </div>

      {/* Fifth row - Start and end times */}

      <div className="m-0 flex w-full justify-between align-middle">
        <div className="flex text-sm ">
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
      {/* Sixth row - coop Start and end dates */}
      {props.otherUser.coopStartDate && props.otherUser.coopEndDate && (
        <div className="m-0 flex w-full justify-between align-middle">
          <div className="flex text-sm ">
            <p className="pr-1">From:</p>
            <p className="font-semibold">
              {dayjs(props.otherUser.coopStartDate).format("MMMM")}
            </p>
            <p className="px-2 font-semibold">|</p>
            <p className="pr-1">To:</p>
            <p className="font-semibold">
              {dayjs(props.otherUser.coopEndDate).format("MMMM")}
            </p>
          </div>
        </div>
      )}

      {/* Seventh row - Seats avaliable*/}

      {props.otherUser.role === "DRIVER" && (
        <div className="flex flex-row text-sm">
          <div className="mr-1">Seats Available:</div>
          <div className="font-semibold">{props.otherUser.seatAvail}</div>
        </div>
      )}

      {/* 8th row - Buttons*/}
      {props.onViewRouteClick && props.rightButton ? (
        <div className="flex flex-row justify-between gap-2">
          <button
            disabled={user.status === "INACTIVE" && user.role !== "VIEWER"}
            onClick={() => {
              props.onViewRouteClick &&
                props.onViewRouteClick(user, props.otherUser);
              trackViewRoute(user.role);
            }}
            className="my-1 w-1/2 rounded-md border border-black p-1 text-center hover:bg-stone-200 disabled:hover:bg-transparent"
          >
            View Route
          </button>
          <button
            onClick={() => {
              if (props.rightButton?.onPress) {
                trackViewRoute(user.role);
                props.rightButton.onPress(props.otherUser);
              }
            }}
            disabled={user.role === "VIEWER" || user.status === "INACTIVE"}
            className={getButtonClassName(props.rightButton)}
          >
            {props.rightButton?.text}
          </button>
        </div>
      ) : null}
    </div>
  );
};
