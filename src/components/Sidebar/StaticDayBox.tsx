import React from "react";

const StaticDayBox = ({
  day,
  isSelected,
  className,
}: {
  day: string;
  isSelected: boolean;
  className?: string;
}): React.ReactElement => {
  const baseClasses =
    "flex h-10 w-10  items-center justify-center rounded-full m-1 border border-black text-xl";

  const selectedClasses = isSelected
    ? "bg-northeastern-red text-white"
    : "bg-white text-black";

  return (
    <div className={`${baseClasses} ${selectedClasses} ${className}`}>
      {day}
    </div>
  );
};
export default StaticDayBox;
