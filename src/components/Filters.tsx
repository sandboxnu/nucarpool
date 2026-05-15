import React, { ReactNode, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import Checkbox from "@mui/material/Checkbox";
import { FiltersState } from "../utils/types";
import { TextField } from "./TextField";
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
  <div className="px-3 ">
    <div className="flex flex-shrink flex-col border-b border-gray-200 py-4">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {isOpen ? <FaMinus /> : <FaPlus />}
      </div>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  </div>
);

interface FiltersProps {
  onClose: () => void;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  filters: FiltersState;
  activeFilters: { [key: string]: boolean };
  resetFilters: () => void;
}

const Filters = ({
  onClose,
  filters,
  setFilters,
  activeFilters,
  resetFilters: externalResetFilters,
}: FiltersProps) => {
  const [distanceOpen, setDistanceOpen] = useState(
    activeFilters.startDistance || activeFilters.endDistance,
  );
  const [checkedOpen, setCheckedOpen] = useState(
    activeFilters.favorites || activeFilters.messaged,
  );
  const [daysMatchOpen, setDaysMatchOpen] = useState(activeFilters.days);
  const [startTimeOpen, setStartTimeOpen] = useState(
    activeFilters.startTime || activeFilters.endTime,
  );
  const [termDatesOpen, setTermDatesOpen] = useState(activeFilters.dateOverlap);
  const daysOfWeek = ["Su", "M", "Tu", "W", "Th", "F", "S"];
  const resetFilters = () => {
    externalResetFilters();
    setDistanceOpen(false);
    setCheckedOpen(false);
    setDaysMatchOpen(false);
    setStartTimeOpen(false);
    setTermDatesOpen(false);
  };
  const handleMonthChange =
    (field: keyof FiltersState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const [year, month] = event.target.value.split("-").map(Number);
      const lastDay = new Date(year, month, 0);
      setFilters((prev) => ({
        ...prev,
        [field]: lastDay,
      }));
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
    field: keyof FiltersState,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(event.target.value, 10);
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDaySelection = (index: number) => {
    setFilters((prev) => {
      const daysArray = prev.daysWorking.split(",").map((day) => day === "1");
      daysArray[index] = !daysArray[index];
      return {
        ...prev,
        daysWorking: daysArray.map((day) => (day ? "1" : "0")).join(","),
      };
    });
  };
  const selectedDaysCount = filters.daysWorking
    .split(",")
    .filter((day) => day === "1").length;
  const getMonthInputClassName = (date: Date, dateOverlap: number) => {
    return `${
      date.toLocaleString("default", { month: "long" }).length > 7 &&
      dateOverlap !== 0
        ? "px-[4px]"
        : "px-4"
    }`;
  };
  const startMonthInputClassName = `h-14 text-md ${getMonthInputClassName(
    filters.startDate,
    filters.dateOverlap,
  )}`;
  const endMonthInputClassName = `h-14 text-md ${getMonthInputClassName(
    filters.endDate,
    filters.dateOverlap,
  )}`;

  return (
    <div className="relative mx-1 h-full select-none overflow-y-auto bg-white px-1 pb-20 scrollbar-thin  scrollbar-track-stone-100 scrollbar-thumb-busy-red scrollbar-track-rounded-full scrollbar-thumb-rounded-full">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 pb-5 pt-2">
        <div className="flex w-full  items-center justify-between">
          <button
            className="flex-1 self-end bg-transparent text-start font-semibold text-northeastern-red hover:text-busy-red"
            onClick={resetFilters}
          >
            Reset All
          </button>
          <h2 className="flex-1 self-end text-center text-xl font-semibold">
            Filters
          </h2>
          <button className="flex-1  pt-1 " onClick={onClose}>
            <FaTimes size={20} className="justify-self-end" />
          </button>
        </div>
      </div>
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
      <FilterSection
        title="Distance"
        isOpen={distanceOpen}
        toggleOpen={() => setDistanceOpen(!distanceOpen)}
      >
        <div className="mt-3">
          <label className="mb-2 block">Max distance from start (miles)</label>
          <div className="flex flex-col items-center gap-3">
            <input
              type="range"
              min="0"
              max="20"
              value={filters.startDistance}
              onChange={(e) => handleRangeChange("startDistance", e)}
              className="h-2 w-full appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #C8102E 0%, #C8102E ${
                  (filters.startDistance / 20) * 100
                }%, #d3d3d3 ${
                  (filters.startDistance / 20) * 100
                }%, #d3d3d3 100%)`,
                height: "8px",
                borderRadius: "5px",
              }}
            />
            <div className="text-lg font-semibold text-northeastern-red">
              {filters.startDistance === 20
                ? `${filters.startDistance}+`
                : filters.startDistance}
            </div>
          </div>

          <label className="mb-2 mt-4 block">
            Max distance from destination (miles)
          </label>
          <div className="flex flex-col items-center gap-3">
            <input
              type="range"
              min="0"
              max="20"
              value={filters.endDistance}
              onChange={(e) => handleRangeChange("endDistance", e)}
              className="h-2 w-full appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #C8102E 0%, #C8102E ${
                  (filters.endDistance / 20) * 100
                }%, #d3d3d3 ${
                  (filters.endDistance / 20) * 100
                }%, #d3d3d3 100%)`,
                height: "8px",
                borderRadius: "5px",
              }}
            />
            <div className="text-lg font-semibold text-northeastern-red">
              {filters.endDistance === 20
                ? `${filters.endDistance}+`
                : filters.endDistance}
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
          <div className="text-md flex justify-between gap-2 font-semibold">
            <button
              className={`grow rounded-full px-4 py-2  ${
                filters.days === 0
                  ? "border-2 border-black bg-northeastern-red text-white"
                  : "border-2 border-gray-300 bg-white text-black"
              }`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  days: 0,
                }))
              }
            >
              Any days
            </button>
            <button
              className={`grow rounded-full px-4 py-2 ${
                filters.days === 1
                  ? "border-2 border-black bg-northeastern-red text-white"
                  : "border-2 border-gray-300 bg-white text-black"
              }`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  days: 1,
                }))
              }
            >
              Exact days
            </button>
            <button
              className={`grow rounded-full px-4 py-2 ${
                filters.days === 2
                  ? "border-2 border-black bg-northeastern-red text-white"
                  : "border-2 border-gray-300 bg-white text-black"
              }`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  days: 2,
                }))
              }
            >
              Flex days
            </button>
          </div>

          {filters.days === 1 || filters.days === 2 ? (
            <>
              <div className="mx-4 flex flex-col  gap-2">
                <div className="mt-4 flex justify-between ">
                  {daysOfWeek.map((day, index) => (
                    <Checkbox
                      key={day + index.toString()}
                      sx={{ padding: 0 }}
                      checked={
                        filters.daysWorking.split(",").map((d) => d === "1")[
                          index
                        ]
                      }
                      onChange={() => toggleDaySelection(index)}
                      checkedIcon={<StaticDayBox day={day} isSelected={true} />}
                      icon={<StaticDayBox day={day} isSelected={false} />}
                    />
                  ))}
                </div>
                {filters.days === 1 ? (
                  <p className="w-full text-xs" style={{ color: "#BCA7A7" }}>
                    (?) Exact days only shows users carpooling during the
                    selected carpool days.
                  </p>
                ) : null}
              </div>
              {filters.days === 2 && (
                <div className="mx-4 mt-2 flex flex-col items-center justify-center">
                  <label className="mb-2 ">Minimum shared carpool days</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedDaysCount}
                    value={
                      filters.flexDays > selectedDaysCount
                        ? selectedDaysCount
                        : filters.flexDays
                    }
                    onChange={(e) => {
                      const newFlexDays = Math.max(
                        1,
                        Math.min(
                          selectedDaysCount,
                          parseInt(e.target.value, 10),
                        ),
                      );
                      if (!isNaN(newFlexDays)) {
                        setFilters((prevFilters) => ({
                          ...prevFilters,
                          flexDays: newFlexDays,
                        }));
                      }
                    }}
                    className="flex h-10 w-14  rounded-full  border-2 border-gray-300 p-2 text-center focus:border-transparent focus:ring-2 focus:ring-northeastern-red "
                  />
                  <p
                    className="w-full  pt-2 text-xs"
                    style={{ color: "#BCA7A7" }}
                  >
                    (?) Flex days shows any users sharing at least this number
                    of carpool days.
                  </p>
                </div>
              )}
            </>
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
              value={filters.startTime}
              onChange={(e) => handleRangeChange("startTime", e)}
              className="h-2 w-full appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #C8102E 0%, #C8102E ${
                  (filters.startTime / 4) * 100
                }%, #d3d3d3 ${(filters.startTime / 4) * 100}%,  #d3d3d3 100%)`,
                height: "8px",
                borderRadius: "5px",
              }}
            />
            <div className="text-lg font-semibold text-northeastern-red">
              {filters.startTime === 4
                ? `${filters.startTime}+`
                : filters.startTime}
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
              value={filters.endTime}
              onChange={(e) => handleRangeChange("endTime", e)}
              className="h-2 w-full appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-northeastern-red"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #C8102E 0%, #C8102E ${
                  (filters.endTime / 4) * 100
                }%,#d3d3d3 ${(filters.endTime / 4) * 100}%,  #d3d3d3 100%)`,
                height: "8px",
                borderRadius: "5px",
              }}
            />
            <div className="text-lg font-semibold text-northeastern-red">
              {filters.endTime === 4 ? `${filters.endTime}+` : filters.endTime}
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
          <div className="text-md mb-4 flex justify-between gap-2 font-semibold">
            <button
              className={`grow rounded-full border-2 px-4 py-2 ${
                filters.dateOverlap === 0
                  ? " border-black bg-northeastern-red text-white"
                  : "border-gray-300 bg-white text-black"
              }`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  dateOverlap: 0,
                }))
              }
            >
              Any
            </button>
            <button
              className={`rounded-full border-2 px-4 py-2 ${
                filters.dateOverlap === 1
                  ? " border-black bg-northeastern-red text-white"
                  : "border-gray-300 bg-white text-black"
              }`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  dateOverlap: 1,
                }))
              }
            >
              Partial overlap
            </button>
            <button
              className={`rounded-full border-2 px-4 py-2 ${
                filters.dateOverlap === 2
                  ? " border-black bg-northeastern-red text-white"
                  : "border-gray-300 bg-white  text-black"
              }`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  dateOverlap: 2,
                }))
              }
            >
              Full overlap
            </button>
          </div>
          {filters.dateOverlap === 1 ? (
            <p
              className="w-full px-4 pb-2 text-xs"
              style={{ color: "#BCA7A7" }}
            >
              (?) Partial overlap shows all users who are carpooling at some
              point between the selected dates.
            </p>
          ) : filters.dateOverlap === 2 ? (
            <p
              className="w-full px-4 pb-2 text-xs"
              style={{ color: "#BCA7A7" }}
            >
              (?) Full overlap shows all users who are carpooling the entire
              range of the selected dates.
            </p>
          ) : null}
          <div className="flex w-full gap-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <label className="mb-2 block font-semibold">Start Date</label>
              <TextField
                type="month"
                inputClassName={`${startMonthInputClassName}`}
                isDisabled={filters.dateOverlap === 0}
                id="coopStartDate"
                value={formatDateToMonth(filters.startDate)}
                onChange={handleMonthChange("startDate")}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <label className="mb-2 block font-semibold">End Date</label>
              <TextField
                type="month"
                inputClassName={`${endMonthInputClassName}`}
                isDisabled={filters.dateOverlap === 0}
                id="coopEndDate"
                value={formatDateToMonth(filters.endDate)}
                onChange={handleMonthChange("endDate")}
              />
            </div>
          </div>
        </div>
      </FilterSection>
      <FilterSection
        title="Favorites + Requests"
        isOpen={checkedOpen}
        toggleOpen={() => setCheckedOpen(!checkedOpen)}
      >
        <div className="mt-3 ">
          <label className="flex cursor-pointer items-center">
            <Checkbox
              checked={filters.favorites}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  favorites: event.target.checked,
                }))
              }
              sx={{
                color: "#C1C1C1",
                "&.Mui-checked": {
                  color: "#c8102e",
                },
              }}
            />
            <span className="text-gray-black">Only show favorites</span>
          </label>

          <label className="flex cursor-pointer items-center">
            <Checkbox
              checked={filters.messaged}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  messaged: event.target.checked,
                }))
              }
              sx={{
                color: "#C1C1C1",
                "&.Mui-checked": {
                  color: "#c8102e",
                },
              }}
              inputProps={{ "aria-label": "Include users I have messaged" }}
            />
            <span className="text-gray-black">
              Include users I have messaged
            </span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
};
export default Filters;
