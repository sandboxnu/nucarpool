import RedMarker from "../../public/red-marker.png";
import GreenMarker from "../../public/green-marker.png";
import BlueMarker from "../../public/blue-marker.png";
import OrangeMarker from "../../public/orange-marker.png";
import Image from "next/image";

interface LegendProps {
  role: string;
}
export const MapLegend = (props: LegendProps) => {
  return (
    <>
      <div className="absolute right-4 top-4 z-10 flex flex-col rounded-md border bg-white bg-opacity-75 p-4">
        <div className="my-1 flex flex-row">
          <Image className="" src={GreenMarker} width={25} height={20} />
          <p className="mx-3">My Start</p>
        </div>
        <div className="my-1 flex flex-row">
          <Image className="" src={RedMarker} width={25} height={20} />
          <p className="mx-3">My Destination</p>
        </div>
        <div className="my-1 flex flex-row">
          <Image className="" src={BlueMarker} width={25} height={20} />
          <p className="mx-3">{props.role + " Start"}</p>
        </div>
        <div className="my-1 flex flex-row">
          <Image className="" src={OrangeMarker} width={25} height={20} />
          <p className="mx-3">{props.role + " Destination"}</p>
        </div>
      </div>
    </>
  );
};
