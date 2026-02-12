import Checkbox from "@mui/material/Checkbox";
import { Controller, Control, FieldError, Merge } from "react-hook-form";
import { OnboardingFormInputs } from "../../../utils/types";
import DayBox from "../../Profile/DayBox";
import StaticDayBox from "../../Sidebar/StaticDayBox";

interface SelectDaysProps {
  control: Control<OnboardingFormInputs>;
  disabled?: boolean;
  useStaticDayBox?: boolean;
  dayBoxClassName?: string;
  error?: Merge<FieldError, (FieldError | undefined)[]> | undefined;
}

const SelectDays = ({
  control,
  disabled = false,
  useStaticDayBox = false,
  dayBoxClassName = "",
  error,
}: SelectDaysProps) => {
  const daysOfWeek = ["Su", "M", "Tu", "W", "Th", "F", "S"];

  const DayBoxComponent = useStaticDayBox ? StaticDayBox : DayBox;

  return (
    <>
      <div className="flex w-full items-center justify-evenly">
        {daysOfWeek.map((day, index) => (
          <Controller
            key={day + index.toString()}
            name={`daysWorking.${index}`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                key={day + index.toString()}
                sx={{
                  input: { width: 1, height: 1 },
                  aspectRatio: 1,
                  width: 1,
                  height: 1,
                  padding: 0,
                }}
                disabled={disabled}
                checked={value}
                onChange={onChange}
                checkedIcon={
                  <DayBoxComponent
                    className={dayBoxClassName}
                    day={day}
                    isSelected={true}
                  />
                }
                icon={
                  <DayBoxComponent
                    className={dayBoxClassName}
                    day={day}
                    isSelected={false}
                  />
                }
              />
            )}
          />
        ))}
      </div>
    </>
  );
};

export default SelectDays;
