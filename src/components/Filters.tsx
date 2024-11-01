import React, { ReactNode, useContext, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { Controller } from "react-hook-form";
import Checkbox from "@mui/material/Checkbox";
import DayBox from "./Profile/DayBox";
import { User } from "@prisma/client";
import { EnhancedPublicUser } from "../utils/types";
import { UserContext } from "../utils/userContext";
import { TextField } from "./TextField";
import { setValue } from "rc-field-form/es/utils/valueUtil";
import StaticDayBox from "./Sidebar/StaticDayBox";

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  toggleOpen: () => void;
  children: ReactNode;
}
const FilterSection = ({
  title,
  isOpen,
  toggleOpen,
  children,
}: FilterSectionProps) => (
  <div className="border-b  border-gray-200 py-4">
    <div
      className="flex cursor-pointer items-center justify-between"
      onClick={toggleOpen}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {isOpen ? <FaMinus /> : <FaPlus />}
    </div>
    {isOpen && <div className="mt-3">{children}</div>}
  </div>
);

interface FiltersProps {
  onClose: () => void;
}

const Filters = ({ onClose }: FiltersProps) => {
  const user = useContext(UserContext);
  const [daysFilter, setDaysFilter] = useState(0);
  const [datesFilter, setDatesFilter] = useState(0);
  const [distanceOpen, setDistanceOpen] = useState(true);
  const [daysMatchOpen, setDaysMatchOpen] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [termDatesOpen, setTermDatesOpen] = useState(false);
  const [maxDistanceStart, setMaxDistanceStart] = useState(20);
  const [maxDistanceEnd, setMaxDistanceEnd] = useState(20);
  const [maxStartTime, setMaxStartTime] = useState(4);
  const [maxEndTime, setMaxEndTime] = useState(4);
  const [selectedDays, setSelectedDays] = useState<boolean[]>(
    user?.daysWorking
      ? user.daysWorking.split(",").map((day) => day === "1")
      : Array(7).fill(false)
  );
  const [selectedMonths, setSelectedMonths] = useState<{
    [key: string]: Date | null;
  }>({
    coopStartDate: user?.coopStartDate ? new Date(user.coopStartDate) : null,
    coopEndDate: user?.coopEndDate ? new Date(user.coopEndDate) : null,
  });
  const daysOfWeek = ["Su", "M", "Tu", "W", "Th", "F", "S"];
  const handleMonthChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const [year, month] = event.target.value.split("-").map(Number);
      const lastDay = new Date(year, month, 0);
      setSelectedMonths((prev) => ({ ...prev, [field]: lastDay }));
    };

  const formatDateToMonth = (date: Date | null) => {
    if (!date) {
      return undefined;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };
  const handleRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setValue: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = parseInt(e.target.value, 10);
    setValue(value);
  };
  const toggleDaySelection = (index: number) => {
    setSelectedDays((prev) => {
      const updatedDays = [...prev];
      updatedDays[index] = !updatedDays[index];
      return updatedDays;
    });
  };

  return (
    <div className="h-full w-full select-none overflow-y-auto bg-white p-1">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="mx-auto text-xl font-semibold">Filters</h2>
        <button className="self-center pt-1 text-black" onClick={onClose}>
          <FaTimes size={20} />
        </button>
      </div>
      <div className="border-b border-gray-200 " />

      <FilterSection
        title="Distance"
        isOpen={distanceOpen}
        toggleOpen={() => setDistanceOpen(!distanceOpen)}
      >
        <style>
          {`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 25px;
            width: 25px;
            border-radius: 50%;
            border: 1px solid black;
            background: white; 
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb {
            height: 25px;
            width: 25px;
            border-radius: 50%;
            border: 1px solid black;
            background: white; 
            cursor: pointer;
          }
        `}
        </style>
        <div className="mt-3">
          <label className="mb-2 block">Max distance from start (miles)</label>
          <div className="flex flex-col items-center gap-3">
            <input
              type="range"
              min="0"
              max="20"
              value={maxDistanceStart}
              onChange={(e) => handleRangeChange(e, setMaxDistanceStart)}
              className="h-2 w-full appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #C8102E 0%, #C8102E ${
                  (maxDistanceStart / 20) * 100
                }%, #d3d3d3 ${(maxDistanceStart / 20) * 100}%, #d3d3d3 100%)`,
                height: "8px",
                borderRadius: "5px",
              }}
            />
            <div className="text-lg font-semibold text-northeastern-red">
              {maxDistanceStart === 20
                ? `${maxDistanceStart}+`
                : maxDistanceStart}
            </div>
          </div>

          <label className="mb-2 mt-6 block">
            Max distance from destination (miles)
          </label>
          <div className="flex flex-col items-center gap-3">
            <input
              type="range"
              min="0"
              max="20"
              value={maxDistanceEnd}
              onChange={(e) => handleRangeChange(e, setMaxDistanceEnd)}
              className="h-2 w-full appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #C8102E 0%, #C8102E ${
                  (maxDistanceEnd / 20) * 100
                }%, #d3d3d3 ${(maxDistanceEnd / 20) * 100}%, #d3d3d3 100%)`,
                height: "8px",
                borderRadius: "5px",
              }}
            />
            <div className="text-lg font-semibold text-northeastern-red">
              {maxDistanceEnd === 20 ? `${maxDistanceEnd}+` : maxDistanceEnd}
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection
        title="Carpool Days Match"
        isOpen={daysMatchOpen}
        toggleOpen={() => setDaysMatchOpen(!daysMatchOpen)}
      >
        <div className="mt-3">
          <div className="text-md flex gap-2 font-semibold">
            <button
              className={`rounded-full px-4 py-2  ${
                daysFilter === 0
                  ? "border-2 border-black bg-northeastern-red text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setDaysFilter(0)}
            >
              Any days
            </button>
            <button
              className={`rounded-full px-4 py-2 ${
                daysFilter === 1
                  ? "border-2 border-black bg-northeastern-red text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setDaysFilter(1)}
            >
              Exact days
            </button>
            <button
              className={`rounded-full px-4 py-2 ${
                daysFilter === 2
                  ? "border-2 border-black bg-northeastern-red text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setDaysFilter(2)}
            >
              Flex days
            </button>
          </div>

          {daysFilter === 1 ? (
            <div className="mt-4 flex flex-wrap items-start">
              {daysOfWeek.map((day, index) => (
                <Checkbox
                  key={day + index.toString()}
                  sx={{
                    padding: 0,
                  }}
                  checked={selectedDays[index]}
                  onChange={() => toggleDaySelection(index)}
                  checkedIcon={<StaticDayBox day={day} isSelected={true} />}
                  icon={<StaticDayBox day={day} isSelected={false} />}
                />
              ))}
            </div>
          ) : daysFilter === 2 ? (
            <div className="flex w-full flex-col justify-center">
              <label className="mb-2 mt-4 self-center">
                Minimum shared carpool days
              </label>
              <input
                type="number"
                min="1"
                max="5"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (parseInt(target.value) > 5) {
                    target.value = "5";
                  } else if (parseInt(target.value) < 1) {
                    target.value = "1";
                  }
                }}
                className="flex h-10 w-16  self-center rounded-full border border-gray-400 p-2 text-center focus:border-transparent focus:ring-2  focus:ring-northeastern-red "
              />
            </div>
          ) : null}
        </div>
      </FilterSection>
      <FilterSection
        title="Start Time"
        isOpen={startTimeOpen}
        toggleOpen={() => setStartTimeOpen(!startTimeOpen)}
      >
        <div className="mt-3">
          <label className="mb-2 block">
            Min deviation in start time (hours)
          </label>
          <div className="flex flex-col items-center gap-3">
            <input
              type="range"
              min="0"
              max="4"
              value={maxStartTime}
              onChange={(e) => handleRangeChange(e, setMaxStartTime)}
              className="h-2 w-full appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #C8102E 0%, #C8102E ${
                  (maxStartTime / 4) * 100
                }%, #d3d3d3 ${(maxStartTime / 4) * 100}%,  #d3d3d3 100%)`,
                height: "8px",
                borderRadius: "5px",
              }}
            />
            <div className="text-lg font-semibold text-northeastern-red">
              {maxStartTime === 4 ? `${maxStartTime}+` : maxStartTime}
            </div>
          </div>
          <label className="mb-2 mt-4 block">
            Max deviation in end time (hours)
          </label>
          <div className="flex flex-col items-center gap-3">
            <input
              type="range"
              min="0"
              max="4"
              value={maxEndTime}
              onChange={(e) => handleRangeChange(e, setMaxEndTime)}
              className="h-2 w-full appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #C8102E 0%, #C8102E ${
                  (maxEndTime / 4) * 100
                }%,#d3d3d3 ${(maxEndTime / 4) * 100}%,  #d3d3d3 100%)`,
                height: "8px",
                borderRadius: "5px",
              }}
            />
            <div className="text-lg font-semibold text-northeastern-red">
              {maxEndTime === 4 ? `${maxEndTime}+` : maxEndTime}
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection
        title="Carpool Term Dates"
        isOpen={termDatesOpen}
        toggleOpen={() => setTermDatesOpen(!termDatesOpen)}
      >
        <div className="mt-3">
          <div className="mb-4 flex gap-1 text-sm font-semibold">
            <button
              className={`rounded-full px-4 py-2 ${
                datesFilter === 0
                  ? "border border-black bg-northeastern-red text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setDatesFilter(0)}
            >
              Any dates
            </button>
            <button
              className={`rounded-full px-4 py-2 ${
                datesFilter === 1
                  ? "border border-black bg-northeastern-red text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setDatesFilter(1)}
            >
              Partial overlap
            </button>
            <button
              className={`rounded-full px-4 py-2 ${
                datesFilter === 2
                  ? "border border-black bg-northeastern-red text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setDatesFilter(2)}
            >
              Full overlap
            </button>
          </div>
          <div className="flex w-full gap-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <label className="mb-2 block font-semibold">Start Date</label>
              <TextField
                type="month"
                inputClassName="h-14 text-lg"
                isDisabled={datesFilter === 0}
                id="coopStartDate"
                value={formatDateToMonth(selectedMonths.coopStartDate) || ""}
                onChange={handleMonthChange("coopStartDate")}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <label className="mb-2 block font-semibold">End Date</label>
              <TextField
                type="month"
                inputClassName="h-14 text-lg"
                isDisabled={datesFilter === 0}
                id="coopEndDate"
                value={formatDateToMonth(selectedMonths.coopEndDate) || ""}
                onChange={handleMonthChange("coopEndDate")}
              />
            </div>
          </div>
        </div>
      </FilterSection>
    </div>
  );
};
export default Filters;
