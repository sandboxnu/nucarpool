import React from "react";

const DayBox = ({
  day,
  isSelected,
}: {
  day: string;
  isSelected: boolean;
}): React.ReactElement => {
  const baseClasses =
    "flex md:h-14 md:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full ml-2 border border-black lg:text-2xl md:text-lg";

  const selectedClasses = isSelected
    ? "bg-northeastern-red text-white"
    : "bg-white text-black";

  return <div className={`${baseClasses} ${selectedClasses}`}>{day}</div>;
};

export default DayBox;
