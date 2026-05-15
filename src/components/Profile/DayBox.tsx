import React from "react";

const DayBox = ({
  day,
  isSelected,
}: {
  day: string;
  isSelected: boolean;
}): React.ReactElement => {
  const baseClasses =
    "flex h-10 w-10 items-center justify-center rounded-full ml-2 border \
    border-black text-xl sm:h-10 sm:w-10 sm:text-lg md:h-14 md:w-14 md:text-lg \
    lg:h-16 lg:w-16 lg:text-2xl";

  const selectedClasses = isSelected
    ? "bg-northeastern-red text-white"
    : "bg-white text-black";

  return <div className={`${baseClasses} ${selectedClasses}`}>{day}</div>;
};

export default DayBox;
