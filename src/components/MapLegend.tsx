import RedSquare from "../../public/driver-dest.png";
import BlueSquare from "../../public/user-dest.png";
import UserDriver from "../../public/user-dest-driver.png";
import OrangeSquare from "../../public/rider-dest.png";
import Image from "next/image";
interface MapLegendProps {
  role: string;
}
export const MapLegend = (props: MapLegendProps) => {
  const role = props.role;
  return (
    <>
      <div className="text-md absolute bottom-8 left-2 z-10  flex flex-col rounded-xl border bg-white p-2  md:text-lg">
        <div className="my-1 flex flex-row items-center">
          {(role === "VIEWER" || role === "RIDER") && (
            <Image
              className=""
              alt=""
              src={BlueSquare}
              width={32}
              height={42}
            />
          )}
          {role === "DRIVER" && (
            <Image
              className=""
              alt=""
              src={UserDriver}
              width={32}
              height={42}
            />
          )}
          <p className="mx-2">My Destination</p>
        </div>
        {(role === "VIEWER" || role === "RIDER") && (
          <div className="my-1 flex flex-row items-center">
            <Image className="" alt="" src={RedSquare} width={32} height={42} />
            <p className="mx-2">{"Driver Destination"}</p>
          </div>
        )}
        {(role === "VIEWER" || role === "DRIVER") && (
          <div className="my-1 flex flex-row items-center">
            <Image
              className=""
              alt=""
              src={OrangeSquare}
              width={32}
              height={42}
            />
            <p className="mx-2">{"Rider Destination"}</p>
          </div>
        )}
      </div>
    </>
  );
};
