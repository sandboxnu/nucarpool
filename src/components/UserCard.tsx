import Rating from "@mui/material/Rating/Rating";
import dayjs from "dayjs";
import mapboxgl from "mapbox-gl";
import { User } from "@prisma/client";

interface UserCardProps {
  user: User;
  inputProps?: {
    map: mapboxgl.Map;
    previousMarkers: mapboxgl.Marker[];
    clearMarkers: () => void;
  };
}

const SeatAvailDisplay = (seatAvail: number) => {
  const backgroundColorCSS = (seatAvail: number) => {
    if (seatAvail === 1) {
      return " bg-red-300";
    } else if (seatAvail === 2) {
      return " bg-yellow-300";
    } else {
      return " bg-green-200";
    }
  };
  return (
    <div
      className={
        "w-7 h-7 flex justify-center items-center rounded-md" +
        backgroundColorCSS(seatAvail)
      }
    >
      {seatAvail}
    </div>
  );
};

const DaysWorkingDisplay = (daysWorking: string) => {
  const boxes: JSX.Element[] = [];
  for (let i = 0; i < daysWorking.length; i = i + 2) {
    let backgroundColor = "";
    if (daysWorking[i] == "1") {
      backgroundColor = " bg-gray-400";
    }
    boxes.push(
      <div
        className={"w-4 h-4 border-l-0 border border-black" + backgroundColor}
      ></div>
    );
  }
  return <div className="flex border-l border-black h-min">{boxes}</div>;
};

export default function (props: UserCardProps): JSX.Element {
  const viewRoute = (user: User) => {
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
    <div className="bg-stone-100 text-left px-6 py-4 rounded-xl m-3.5 align-center flex flex-col">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <p className="text-xl font-medium ">{props.user.name}</p>
          {SeatAvailDisplay(props.user.seatAvail)}
        </div>
        <Rating name="" max={1} />
      </div>
      <p>{props.user.startLocation}</p>
      <div className="flex flex-col">
        <div className="w-full flex flex-row justify-between items-center">
          <p>{props.user.companyName}</p>
          {DaysWorkingDisplay(props.user.daysWorking)}
        </div>
        <div className="w-full m-0 flex flex-row justify-between align-middle">
          <button
            onClick={() => viewRoute(props.user)}
            className="underline font-light align-text-top"
          >
            <em onClick={() => viewRoute(props.user)}>View Route</em>
          </button>
          {/* Add user bar */}
          <div className="font-medium">
            <p>{"Start: " + dayjs(props.user.startTime).format("hh:mm")}</p>
            <p>{"End: " + dayjs(props.user.endTime).format("hh:mm")}</p>
          </div>
        </div>
        <button className="bg-red-500 hover:bg-red-700 rounded-xl m-2 px-2 py-0.5 text-center text-white">
          Connect
        </button>
      </div>
    </div>
  );
}
