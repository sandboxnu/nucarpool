import RedSquare from "../../public/red-square.png";
import BlueSquare from "../../public/blue-square.png";
import OrangeSquare from "../../public/orange-square.png";
import Image from "next/image";

export const MapLegend = () => {
  return (
    <>
      <div className="text-md absolute bottom-8 left-2 z-10 flex flex-col rounded-xl border bg-white p-2  md:text-lg">
        <div className="my-1 flex flex-row">
          <Image className="" src={BlueSquare} width={32} height={32} />
          <p className="mx-2">My Destination</p>
        </div>
        <div className="my-1 flex flex-row">
          <Image className="" src={RedSquare} width={32} height={32} />
          <p className="mx-2">{"Driver Destination"}</p>
        </div>
        <div className="my-1 flex flex-row">
          <Image className="" src={OrangeSquare} width={32} height={32} />
          <p className="mx-2">{"Rider Destination"}</p>
        </div>
      </div>
    </>
  );
};
