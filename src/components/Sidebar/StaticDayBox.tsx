import React from "react";

const StaticDayBox = ({
  day,
  isSelected,
}: {
  day: string;
  isSelected: boolean;
}): React.ReactElement => {
  const baseClasses =
    "flex h-10 w-10  items-center justify-center rounded-full m-1 border border-black text-xl";

  const selectedClasses = isSelected
    ? "bg-northeastern-red text-white"
    : "bg-white text-black";

  return <div className={`${baseClasses} ${selectedClasses}`}>{day}</div>;
};
export default StaticDayBox;
