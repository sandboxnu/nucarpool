import RedMarker from "../../public/red-marker.png";
import GreenMarker from "../../public/green-marker.png";
import BlueMarker from "../../public/blue-marker.png";
import OrangeMarker from "../../public/orange-marker.png";
import Image from "next/image";

interface LegendProps {
  role: string;
}
export const MapLegend = (props: LegendProps) => {
  console.log("role that map legend is receiving: " + props.role);
  return (
    <div className="flex flex-col absolute top-4 right-4 z-10 bg-white rounded border p-3 bg-opacity-75">
      <div className="flex flex-row my-1">
        <Image className="" src={GreenMarker} width={25} height={20} />
        <p className="mx-3">My Start</p>
      </div>
      <div className="flex flex-row my-1">
        <Image className="" src={RedMarker} width={25} height={20} />
        <p className="mx-3">My Destination</p>
      </div>
      <div className="flex flex-row my-1">
        <Image className="" src={BlueMarker} width={25} height={20} />
        <p className="mx-3">{props.role + " Start"}</p>
      </div>
      <div className="flex flex-row my-1">
        <Image className="" src={OrangeMarker} width={25} height={20} />
        <p className="mx-3">{props.role + " Destination"}</p>
      </div>
    </div>
  );
};
