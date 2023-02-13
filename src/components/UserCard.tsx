import Rating from "@mui/material/Rating/Rating";
import dayjs from "dayjs";
import mapboxgl from "mapbox-gl";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";

interface UserCardProps {
  user: User;
  inputProps?: {
    map: mapboxgl.Map;
    previousMarkers: mapboxgl.Marker[];
    clearMarkers: () => void;
  };
}

export const UserCard = (props: UserCardProps): JSX.Element => {
  /**
   * https://stackoverflow.com/questions/69687530/dynamically-build-classnames-in-tailwindcss
   * Because Tailwind does not support dynnamic CSS, the returns of the two functions below
   * need to be their complete full className in order to be rendered correctly, hence the lack
   * of abstraction. Perhaps there is a better way of doing this though.
   */
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

  const DaysWorkingDisplay = (daysWorking: string) => {
    const boxes: JSX.Element[] = [];
    for (let i = 0; i < daysWorking.length; i = i + 2) {
      let backgroundColor = "";
      if (daysWorking[i] == "1") {
        backgroundColor = " bg-good-green";
      }
      boxes.push(
        <div
          key={i}
          className={"w-6 h-6 border-l-0 border border-black" + backgroundColor}
        ></div>
      );
    }
    return <div className="flex border-l border-black h-min">{boxes}</div>;
  };

  const onViewRouteClick = (user: User) => {
    if (props.inputProps) {
      if (props.inputProps.map !== undefined) {
        props.inputProps.clearMarkers();

        const startMarker = new mapboxgl.Marker({ color: "#2ae916" })
          .setLngLat([props.user.startCoordLng, user.startCoordLat])
          .addTo(props.inputProps.map);

        const endMarker = new mapboxgl.Marker({ color: "#f0220f" })
          .setLngLat([user.companyCoordLng, user.companyCoordLat])
          .addTo(props.inputProps.map);

        props.inputProps.previousMarkers.push(startMarker);
        props.inputProps.previousMarkers.push(endMarker);

        props.inputProps.map.fitBounds([
          [
            Math.min(user.startCoordLng, user.companyCoordLng) - 0.125,
            Math.max(user.startCoordLat, user.companyCoordLat) + 0.05,
          ],
          [
            Math.max(user.startCoordLng, user.companyCoordLng) + 0.05,
            Math.min(user.startCoordLat, user.companyCoordLat) - 0.05,
          ],
        ]);
      }
    }
  };

  return (
    <div
      className={
        "bg-stone-100 text-left px-6 py-4 rounded-xl m-3.5 align-center flex flex-col border-l-[13px] gap-2 shadow-md" +
        borderLColorCSS(props.user.seatAvail)
      }
    >
      <div className="flex justify-between">
        {/* top row */}
        <div className="flex">
          <div className="flex text-lg">
            <p className="font-semibold border-r-2 pr-2 border-r-black">
              {props.user.name}
            </p>
            <p className="font-light pl-2">{props.user.companyName}</p>
          </div>
        </div>
        <Rating name="" size="large" max={1} />
      </div>
      {/* second row */}
      <p className="font-semibold">{props.user.startLocation}</p>
      {/* third row */}
      <div className="w-full flex gap-4 items-center">
        {DaysWorkingDisplay(props.user.daysWorking)}
        <div
          className={
            "w-7 h-7 flex justify-center items-center rounded-md font-semibold" +
            backgroundColorCSS(props.user.seatAvail)
          }
        >
          {props.user.seatAvail}
        </div>
      </div>
      {/* fourth row */}
      <div className="w-full m-0 flex justify-between align-middle">
        <div className="font-normal text-sm flex">
          <p>Start: </p>{" "}
          <p className="font-semibold">
            {dayjs(props.user.startTime).format("hh:mm")}
          </p>
          <p className="font-semibold px-2"> | </p>
          <p>End: </p>{" "}
          <p className="font-semibold">
            {dayjs(props.user.endTime).format("hh:mm")}
          </p>
        </div>
      </div>
      {/* last row */}
      <div className="flex flex-row gap-2 justify-between">
        <button
          onClick={() => onViewRouteClick(props.user)}
          className="w-1/2 hover:bg-stone-200 rounded-md p-1 my-1 text-center border-black border"
        >
          View Route
        </button>
        <button className="bg-northeastern-red w-1/2 hover:bg-red-700 rounded-md p-1 my-1 text-center text-white">
          Connect
        </button>
      </div>
    </div>
  );
};

UserCard.displayName = "UserCard";

export default UserCard;
